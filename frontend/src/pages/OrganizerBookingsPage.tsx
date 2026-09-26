import { useEffect, useMemo, useRef, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { getOrganizerBookings } from '../api/bookingsApi';
import { getEvents } from '../api/eventsApi';
import type { Booking } from '../types/booking.types';
import OrganizerBookingList from '../components/bookings/OrganizerBookingList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import '../styles/BookingsPage.css';

interface EventOption {
  id: string;
  title: string;
}

export default function OrganizerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = () => {
    getOrganizerBookings()
      .then((res: AxiosResponse<Booking[]>) => {
        setBookings(res.data);
      })
      .catch((err) => {
        console.error('Failed to load organizer bookings', err);
        setBookings([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  // Fetch organizer's events list for the filter options
  useEffect(() => {
    if (user) {
      getEvents({ organizerId: user.id })
        .then((res) => {
          const list = res.data.events || res.data || [];
          setEventsList((prev) => {
            const map = new Map<string, string>();
            list.forEach((e: { id: string; title: string }) => map.set(e.id, e.title));
            prev.forEach((e) => map.set(e.id, e.title));
            return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
          });
        })
        .catch(() => undefined);
    }
  }, [user]);

  // Merge events from bookings in case any are missing
  useEffect(() => {
    if (bookings.length > 0) {
      setEventsList((prev) => {
        const map = new Map<string, string>();
        prev.forEach((e) => map.set(e.id, e.title));
        bookings.forEach((b) => {
          if (b.eventId && b.event?.title) {
            map.set(b.eventId, b.event.title);
          }
        });
        return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
      });
    }
  }, [bookings]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Filter bookings based on selected event and search query
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Filter by specific event or all
      if (selectedEventId && b.eventId !== selectedEventId) {
        return false;
      }

      // 2. Search query filter (#id, event name, customer name/username/email)
      if (!searchQuery.trim()) {
        return true;
      }

      const q = searchQuery.trim().toLowerCase();
      const qNoHash = q.replace(/^#/, '');
      const qNoAt = q.replace(/^@/, '');

      // #ID of booking (e.g. full UUID, short UUID or #c3...)
      const id = (b.id ?? '').toLowerCase();
      const bookingLabel = `αίτημα #${id}`;
      const matchesId = id.includes(qNoHash) || bookingLabel.includes(q);

      // Event name
      const eventTitle = (b.event?.title ?? '').toLowerCase();
      const matchesEvent = eventTitle.includes(q);

      // Customer name, username, email
      const firstName = (b.user?.firstName ?? '').toLowerCase();
      const lastName = (b.user?.lastName ?? '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const fullNameReversed = `${lastName} ${firstName}`.trim();
      const username = (b.user?.username ?? '').toLowerCase();
      const email = (b.user?.email ?? '').toLowerCase();

      const matchesCustomer =
        fullName.includes(q) ||
        fullNameReversed.includes(q) ||
        firstName.includes(q) ||
        lastName.includes(q) ||
        username.includes(q) ||
        username.includes(qNoAt) ||
        email.includes(q);

      return matchesId || matchesEvent || matchesCustomer;
    });
  }, [bookings, selectedEventId, searchQuery]);

  const selectedEvent = useMemo(() => {
    return eventsList.find((ev) => ev.id === selectedEventId);
  }, [eventsList, selectedEventId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bookings-page-container">
      <div className="bookings-header">
        <div>
          <h1 className="bookings-title">Κρατήσεις Εκδηλώσεων</h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Διαχείριση και αναζήτηση κρατήσεων για όλες τις εκδηλώσεις σας
          </p>
        </div>
      </div>

      {bookings.length > 0 && (
        <div className="bookings-controls-bar">
          {/* Small Search Bar */}
          <div className="bookings-search-bar">
            <svg
              className="bookings-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.2 4.2" />
            </svg>
            <input
              type="text"
              className="bookings-search-input"
              placeholder="Αναζήτηση (#ID, εκδήλωση, πελάτης, email)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Αναζήτηση κρατήσεων"
            />
            {searchQuery && (
              <button
                type="button"
                className="bookings-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Εκκαθάριση αναζήτησης"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter button to filter between specific events or all */}
          <div className="bookings-filter-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`bookings-event-filter-btn ${selectedEventId ? 'has-active-filter' : ''}`}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span className="filter-btn-icon">🎯</span>
              <span className="filter-btn-label">
                {selectedEvent ? selectedEvent.title : 'Όλες οι Εκδηλώσεις'}
              </span>
              <span className="filter-btn-caret">▾</span>
            </button>

            {selectedEventId && (
              <button
                type="button"
                className="bookings-filter-reset-badge"
                onClick={() => setSelectedEventId('')}
                title="Εμφάνιση όλων των εκδηλώσεων"
              >
                Όλες ✕
              </button>
            )}

            {isDropdownOpen && (
              <div className="bookings-dropdown-popover" role="menu">
                <div className="bookings-dropdown-header">Φιλτράρισμα Εκδήλωσης</div>
                <button
                  type="button"
                  className={`bookings-dropdown-option ${!selectedEventId ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedEventId('');
                    setIsDropdownOpen(false);
                  }}
                  role="menuitem"
                >
                  <span>🎪 Όλες οι Εκδηλώσεις</span>
                  {!selectedEventId && <span className="option-check">✓</span>}
                </button>
                <div className="bookings-dropdown-divider" />
                {eventsList.length === 0 ? (
                  <div className="bookings-dropdown-empty">Δεν βρέθηκαν εκδηλώσεις</div>
                ) : (
                  eventsList.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      className={`bookings-dropdown-option ${selectedEventId === ev.id ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedEventId(ev.id);
                        setIsDropdownOpen(false);
                      }}
                      role="menuitem"
                    >
                      <span className="option-title">{ev.title}</span>
                      {selectedEventId === ev.id && <span className="option-check">✓</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="bookings-results-summary">
          <span>
            {filteredBookings.length === bookings.length
              ? `Σύνολο: ${bookings.length} ${bookings.length === 1 ? 'κράτηση' : 'κρατήσεις'}`
              : `Βρέθηκαν ${filteredBookings.length} από ${bookings.length} κρατήσεις`}
          </span>
          {(selectedEventId || searchQuery) && (
            <button
              type="button"
              className="bookings-clear-all-link"
              onClick={() => {
                setSelectedEventId('');
                setSearchQuery('');
              }}
            >
              Εκκαθάριση φίλτρων
            </button>
          )}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bookings-empty-state">
          <h2>Δεν υπάρχουν κρατήσεις</h2>
          <p>Οι κρατήσεις για τις εκδηλώσεις σας θα εμφανιστούν εδώ.</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bookings-empty-state">
          <h2>Δεν βρέθηκαν αποτελέσματα</h2>
          <p>Δεν βρέθηκε καμία κράτηση που να ταιριάζει με τα κριτήρια αναζήτησης ή φιλτραρίσματος.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSelectedEventId('');
              setSearchQuery('');
            }}
            style={{ marginTop: '12px' }}
          >
            Εμφάνιση όλων των κρατήσεων
          </button>
        </div>
      ) : (
        <OrganizerBookingList bookings={filteredBookings} />
      )}
    </div>
  );
}
