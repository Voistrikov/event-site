import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUnreadCount } from '../../api/messagesApi';
import './EventsAppLayout.css';

export default function EventsAppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const search = searchParams.get('q') ?? '';
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER' || isAdmin;

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadUnread = () => {
      void getUnreadCount()
        .then(({ data }) => setUnreadCount(data.unreadCount))
        .catch(() => undefined);
    };

    loadUnread();
    const interval = window.setInterval(loadUnread, 30_000);
    window.addEventListener('messages-updated', loadUnread);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('messages-updated', loadUnread);
    };
  }, [user]);

  useEffect(() => {
    const closeProfileMenu = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', closeProfileMenu);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('mousedown', closeProfileMenu);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, []);

  const updateSearch = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set('q', value);
    else nextParams.delete('q');
    nextParams.delete('page');

    if (location.pathname !== '/search') {
      navigate(`/search${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
      return;
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="events-page">
      {isSidebarOpen && (
        <div
          className="events-sidebar-backdrop"
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`events-sidebar${isSidebarOpen ? ' is-open' : ''}`} aria-label="Κύρια πλοήγηση">
        <div className="events-sidebar-header">
          <span className="events-sidebar-title">Μενού</span>
          <button
            type="button"
            className="events-sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Κλείσιμο μενού"
          >
            ×
          </button>
        </div>

        <nav className="events-sidebar-nav">
          <NavLink to="/search" end onClick={() => setIsSidebarOpen(false)}>
            <span aria-hidden="true">⌂</span>
            Αρχική
          </NavLink>
          <NavLink to="/profile/info" onClick={() => setIsSidebarOpen(false)}>
            <span aria-hidden="true">♙</span>
            Προφίλ
          </NavLink>
          <NavLink to="/bookings" onClick={() => setIsSidebarOpen(false)}>
            <span aria-hidden="true">▣</span>
            Οι Κρατήσεις μου
          </NavLink>
          <NavLink to="/messaging" onClick={() => setIsSidebarOpen(false)}>
            <span aria-hidden="true">✉</span>
            Μηνύματα
            {unreadCount > 0 && (
              <span className="events-sidebar-badge" aria-label={`${unreadCount} νέα μηνύματα`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>

          {isOrganizer && (
            <>
              <div className="events-sidebar-divider" />
              <span className="events-sidebar-section-title">Διοργανωτής</span>
              <NavLink to="/manage-events" onClick={() => setIsSidebarOpen(false)}>
                <span aria-hidden="true">⚿</span>
                Οι Εκδηλώσεις μου
              </NavLink>
              <NavLink to="/manage-bookings" onClick={() => setIsSidebarOpen(false)}>
                <span aria-hidden="true">◫</span>
                Κρατήσεις Εκδηλώσεων
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <div className="events-sidebar-divider" />
              <span className="events-sidebar-section-title">Διαχείριση</span>
              <NavLink to="/admin" onClick={() => setIsSidebarOpen(false)}>
                <span aria-hidden="true">♜</span>
                Πίνακας Ελέγχου
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <header className="events-navbar">
        <div className="events-navbar-leading">
          <button
            type="button"
            className="events-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Άνοιγμα μενού"
            aria-expanded={isSidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <NavLink to="/search" className="events-brand-link" aria-label="EventHub αρχική σελίδα">
            <span className="events-brand-mark" aria-hidden="true">E</span>
            <span className="brand-name">EventHub</span>
          </NavLink>
        </div>

        <form className="events-navbar-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.2 4.2" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Αναζήτηση εκδηλώσεων..."
            aria-label="Αναζήτηση εκδηλώσεων"
          />
        </form>

        <div className="events-profile-wrapper" ref={profileMenuRef}>
          <button
            type="button"
            className={`events-profile-button${user?.avatarUrl ? ' has-avatar' : ''}`}
            onClick={() => {
              if (!user) {
                navigate('/login');
                return;
              }
              setIsProfileOpen((open) => !open);
            }}
            aria-label={user ? 'Άνοιγμα λογαριασμού' : 'Σύνδεση'}
            aria-expanded={user ? isProfileOpen : undefined}
            title={user ? 'Λογαριασμός' : 'Σύνδεση'}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5.5 20c.8-3.25 3.2-5 6.5-5s5.7 1.75 6.5 5" />
              </svg>
            )}
          </button>

          {user && isProfileOpen && (
            <div className="events-profile-menu" role="dialog" aria-label="Στοιχεία λογαριασμού">
              <div className="events-profile-details">
                <span>Username</span>
                <strong>{user.username}</strong>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <button type="button" className="events-profile-logout" onClick={handleLogout}>
                Αποσύνδεση
              </button>
            </div>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  );
}
