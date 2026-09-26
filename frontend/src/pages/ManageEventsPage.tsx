import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
  createEvent,
} from '../api/eventsApi';
import type { Event, EventFormData, EventStatus, EventType } from '../types/event.types';
import { EVENT_TYPES, eventTypeLabel } from '../types/event.types';
import { formatDate } from '../utils/dateFormat';
import EventForm from '../components/events/EventForm';
import '../styles/AdminPage.css';
import '../styles/ManageEventsPage.css';

interface ListEventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS: Array<{ label: string; value: EventStatus | '' }> = [
  { label: 'Όλες οι Καταστάσεις', value: '' },
  { label: 'Πρόχειρο',           value: 'DRAFT' },
  { label: 'Δημοσιευμένη',       value: 'PUBLISHED' },
  { label: 'Ολοκληρωμένη',       value: 'COMPLETED' },
  { label: 'Ακυρωμένη',          value: 'CANCELLED' },
];

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Πρόχειρο',
  PUBLISHED: 'Δημοσιευμένη',
  COMPLETED: 'Ολοκληρωμένη',
  CANCELLED: 'Ακυρωμένη',
};

function EventStatusBadge({ status }: { status: EventStatus }) {
  const cls = status === 'PUBLISHED' ? 'badge badge-approved'
            : status === 'DRAFT'     ? 'badge badge-pending'
            : status === 'CANCELLED' ? 'badge badge-rejected'
            : 'badge badge-organizer';
  return <span className={cls}>{STATUS_LABELS[status] || status}</span>;
}

export default function ManageEventsPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<ListEventsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<EventType | ''>('');
  const [filterStatus, setFilterStatus] = useState<EventStatus | ''>('');
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async (p = page) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getEvents({
        organizerId: user.id,
        ...(filterType && { eventType: filterType }),
        ...(filterStatus && { status: filterStatus }),
        page: p,
        limit: 20,
      });

      const data = res.data;
      if (Array.isArray(data)) {
        setResult({
          events: data,
          total: data.length,
          page: 1,
          limit: 20,
          totalPages: 1,
        });
      } else {
        setResult({
          events: data.events || [],
          total: data.total ?? (data.events ? data.events.length : 0),
          page: data.page ?? p,
          limit: data.limit ?? 20,
          totalPages: data.totalPages ?? 1,
        });
      }
      setPage(p);
    } catch {
      setError('Αποτυχία φόρτωσης εκδηλώσεων.');
    } finally {
      setLoading(false);
    }
  }, [user, page, filterType, filterStatus]);

  useEffect(() => {
    if (user) {
      load(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterType, filterStatus]);

  // Handle Escape key and body scroll lock for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (event: Event) => {
    setModalError(null);
    try {
      const res = await getEvent(event.id);
      setEditingEvent(res.data);
    } catch {
      setEditingEvent(event);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setModalError(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Να διαγραφεί οριστικά αυτή η εκδήλωση;')) return;
    setActing(id);
    try {
      await deleteEvent(id);
      await load(page);
    } catch {
      setError('Αποτυχία διαγραφής της εκδήλωσης.');
    } finally {
      setActing(null);
    }
  };

  const handlePublish = async (id: string) => {
    setActing(id);
    try {
      await publishEvent(id);
      await load(page);
    } catch {
      setError('Αποτυχία δημοσίευσης της εκδήλωσης.');
    } finally {
      setActing(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Να ακυρωθεί η εκδήλωση; Οι ενεργές κρατήσεις θα ακυρωθούν και οι συμμετέχοντες θα ενημερωθούν.')) return;
    setActing(id);
    try {
      await cancelEvent(id);
      await load(page);
    } catch {
      setError('Αποτυχία ακύρωσης της εκδήλωσης.');
    } finally {
      setActing(null);
    }
  };

  const handleComplete = async (id: string) => {
    setActing(id);
    try {
      await completeEvent(id);
      await load(page);
    } catch {
      setError('Αποτυχία ολοκλήρωσης της εκδήλωσης.');
    } finally {
      setActing(null);
    }
  };

  const handleFormSubmit = async (data: EventFormData, publishAfterSave: boolean) => {
    setModalError(null);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        if (publishAfterSave && editingEvent.status === 'DRAFT') {
          await publishEvent(editingEvent.id);
        }
      } else {
        const response = await createEvent(data);
        if (publishAfterSave) {
          await publishEvent(response.data.id);
        }
      }
      handleCloseModal();
      await load(page);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      const msg =
        errorResponse.response?.data?.message ||
        (editingEvent ? 'Αποτυχία ενημέρωσης της εκδήλωσης.' : 'Αποτυχία δημιουργίας της εκδήλωσης.');
      setModalError(msg);
      throw err;
    }
  };

  return (
    <div className="admin-page manage-events-page">
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">📅 Οι Εκδηλώσεις μου</h1>
          <p className="page-subtitle">Διαχείριση των εκδηλώσεών σας και παρακολούθηση κρατήσεων</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreate}
          >
            + Νέα Εκδήλωση
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <span className="table-toolbar-title">Εκδηλώσεις Διοργανωτή</span>

          {/* Filters */}
          <div className="filters-row">
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EventType | '')}
            >
              <option value="">Όλοι οι Τύποι</option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EventStatus | '')}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => load(1)}
              disabled={loading}
            >
              {loading ? 'Φόρτωση…' : '↻ Ανανέωση'}
            </button>
          </div>
        </div>

        {/* Table */}
        {loading && <div className="spinner" />}

        {result && !loading && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Εκδήλωση</th>
                    <th>Τύπος</th>
                    <th>Ημερομηνία</th>
                    <th>Κρατήσεις</th>
                    <th>Κατάσταση</th>
                    <th>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {result.events.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}
                      >
                        Δεν υπάρχουν εκδηλώσεις.
                      </td>
                    </tr>
                  ) : (
                    result.events.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{e.title}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {e.venue ? `${e.venue}, ${e.city}` : e.city || '—'}
                          </div>
                        </td>
                        <td>{eventTypeLabel(e.eventType)}</td>
                        <td style={{ color: '#6b7280', fontSize: 13 }}>
                          {formatDate(e.startDateTime)}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#1f2937' }}>
                            {e._count?.bookings ?? 0}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: 12 }}> / {e.capacity}</span>
                        </td>
                        <td><EventStatusBadge status={e.status} /></td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/events/${e.id}`} className="btn btn-secondary btn-sm">
                              Προβολή
                            </Link>
                            {(e.status === 'DRAFT' || e.status === 'PUBLISHED') && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEdit(e)}
                              >
                                Επεξεργασία
                              </button>
                            )}
                            {e.status === 'DRAFT' && (
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                disabled={acting === e.id}
                                onClick={() => handlePublish(e.id)}
                              >
                                Δημοσίευση
                              </button>
                            )}
                            {e.status === 'PUBLISHED' && new Date(e.endDateTime) < new Date() && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={acting === e.id}
                                onClick={() => handleComplete(e.id)}
                              >
                                Ολοκλήρωση
                              </button>
                            )}
                            {e.status === 'PUBLISHED' && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                disabled={acting === e.id}
                                onClick={() => handleCancel(e.id)}
                              >
                                Ακύρωση
                              </button>
                            )}
                            {(e.status === 'DRAFT' ||
                              (e.status === 'PUBLISHED' && (e._count?.bookings ?? 0) === 0)) && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                disabled={acting === e.id}
                                onClick={() => handleDelete(e.id)}
                              >
                                Διαγραφή
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span>
                {result.total === 0
                  ? '0 εκδηλώσεις'
                  : `Showing ${((page - 1) * result.limit) + 1}–${Math.min(
                      page * result.limit,
                      result.total
                    )} of ${result.total} εκδηλώσεις`}
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                >
                  ← Prev
                </button>
                <span style={{ padding: '5px 12px', fontSize: 13 }}>
                  Page {page} / {result.totalPages || 1}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page >= result.totalPages}
                  onClick={() => load(page + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Event Modal (Used for both Create and Edit) */}
      {isModalOpen && (
        <div
          className="create-event-modal-backdrop"
          onClick={handleCloseModal}
        >
          <div
            className="create-event-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >
            <div className="create-event-modal-header">
              <h2 id="event-modal-title" className="create-event-modal-title">
                {editingEvent ? '✏️ Επεξεργασία Εκδήλωσης' : '➕ Νέα Εκδήλωση'}
              </h2>
              <button
                type="button"
                className="create-event-modal-close"
                onClick={handleCloseModal}
                aria-label="Κλείσιμο"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {modalError}
              </div>
            )}

            <EventForm
              key={editingEvent?.id ?? 'create'}
              initial={editingEvent || {}}
              onSubmit={handleFormSubmit}
              submitLabel={editingEvent ? 'Αποθήκευση Αλλαγών' : 'Αποθήκευση ως Πρόχειρο'}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
