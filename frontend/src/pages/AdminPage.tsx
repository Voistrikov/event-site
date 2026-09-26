import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listUsers, updateUserStatus, exportEventsJson, exportEventsXml } from '../api/adminApi';
import type { ListUsersResponse } from '../api/adminApi';
import type { User, Role, UserStatus } from '../types/user.types';
import Button from '../components/common/Button';
import '../styles/AdminPage.css';

const ROLE_OPTIONS:   Array<{ label: string; value: Role | '' }>       = [
  { label: 'All Roles',    value: '' },
  { label: 'Attendee',     value: 'ATTENDEE' },
  { label: 'Organizer',    value: 'ORGANIZER' },
  { label: 'Admin',        value: 'ADMIN' },
];
const STATUS_OPTIONS: Array<{ label: string; value: UserStatus | '' }> = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending',      value: 'PENDING' },
  { label: 'Approved',     value: 'APPROVED' },
  { label: 'Rejected',     value: 'REJECTED' },
];

function RoleBadge({ role }: { role: Role }) {
  const cls = role === 'ADMIN' ? 'badge badge-admin'
            : role === 'ORGANIZER' ? 'badge badge-organizer'
            : 'badge badge-attendee';
  return <span className={cls}>{role}</span>;
}

function StatusBadge({ status }: { status: UserStatus }) {
  const cls = status === 'APPROVED' ? 'badge badge-approved'
            : status === 'PENDING'  ? 'badge badge-pending'
            : 'badge badge-rejected';
  return <span className={cls}>{status}</span>;
}

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [result,   setResult]   = useState<ListUsersResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [filterRole,   setFilterRole]   = useState<Role | ''>('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listUsers({
        ...(filterRole   && { role:   filterRole }),
        ...(filterStatus && { status: filterStatus }),
        page: p,
        limit: 20,
      });
      setResult(res.data);
      setPage(p);
    } catch {
      setError('Failed to load users. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, filterStatus]);

  const handleStatusUpdate = async (user: User, status: 'APPROVED' | 'REJECTED') => {
    setActing(user.id);
    try {
      await updateUserStatus(user.id, status);
      await load(page);
    } catch {
      setError(`Failed to ${status.toLowerCase()} user.`);
    } finally {
      setActing(null);
    }
  };

  const handleExport = async (format: 'json' | 'xml') => {
    try {
      const res = format === 'json' ? await exportEventsJson() : await exportEventsXml();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `events.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      setError(`Failed to export ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="admin-page">
      <div className="profile-page-header">
        <div>
          <h1 className="profile-page-title">🛡️ Πίνακας Ελέγχου</h1>
          <p className="page-subtitle">Διαχείριση χρηστών και εξαγωγή δεδομένων (XML/JSON)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('json')}>
            ⬇️ Export JSON
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleExport('xml')}>
            ⬇️ Export XML
          </button>
        </div>
      </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>
        )}

        <div className="table-card">
          <div className="table-toolbar">
            <span className="table-toolbar-title">Χρήστες Πλατφόρμας</span>

            {/* Filters */}
            <div className="filters-row">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as Role | '')}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as UserStatus | '')}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <Button
                onClick={() => load(1)}
                disabled={loading}
              >
                {loading ? 'Φόρτωση…' : '↻ Ανανέωση'}
              </Button>
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
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                          No users found matching the selected filters.
                        </td>
                      </tr>
                    ) : result.data.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>@{u.username}</div>
                        </td>
                        <td style={{ color: '#6b7280' }}>{u.email}</td>
                        <td><RoleBadge role={u.role} /></td>
                        <td><StatusBadge status={u.status} /></td>
                        <td style={{ color: '#6b7280', fontSize: 13 }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="table-actions">
                            {u.status !== 'APPROVED' && u.role !== 'ADMIN' && (
                              <button
                                className="btn btn-success btn-sm"
                                disabled={acting === u.id}
                                onClick={() => handleStatusUpdate(u, 'APPROVED')}
                              >
                                Approve
                              </button>
                            )}
                            {u.status !== 'REJECTED' && u.role !== 'ADMIN' && u.id !== currentUser?.id && (
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={acting === u.id}
                                onClick={() => handleStatusUpdate(u, 'REJECTED')}
                              >
                                Reject
                              </button>
                            )}
                            <Link to={`/admin/users/${u.id}`} className="btn btn-secondary btn-sm">
                              Προβολή
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span>
                  Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, result.total)} of {result.total} users
                </span>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => load(page - 1)}
                  >
                    ← Prev
                  </button>
                  <span style={{ padding: '5px 12px', fontSize: 13 }}>
                    Page {page} / {result.totalPages}
                  </span>
                  <button
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
    </div>
  );
}
