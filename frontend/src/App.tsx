import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import WelcomePage        from './pages/WelcomePage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import EventsPage         from './pages/EventsPage';
import HomePage           from './pages/HomePage';
import BookingsPage       from './pages/BookingsPage';
import MessagingPage      from './pages/MessagingPage';
import ManageEventsPage   from './pages/ManageEventsPage';
import CreateEventPage    from './pages/CreateEventPage';
import EditEventPage      from './pages/EditEventPage';
import AdminPage          from './pages/AdminPage';
import NotFoundPage       from './pages/NotFoundPage';
import ProfileLayout    from './components/layout/ProfileLayout';
import ProfileInfoPage from './pages/ProfileInfoPage';
import EventDetailsPage from './pages/EventDetailsPage';
import OrganizerBookingsPage from './pages/OrganizerBookingsPage';

export default function App() {
  const { initialize } = useAuth();

  // Rehydrate the auth store once on mount
  useEffect(() => {
    void initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────────────── */}
      <Route path="/"                  element={<WelcomePage />} />
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/register"          element={<RegisterPage />} />
      <Route path="/pending-approval"  element={<PendingApprovalPage />} />
      <Route path="/events"            element={<EventsPage />} />
      <Route path="/search"            element={<EventsPage />} />
      <Route path="/events/:id"        element={<EventDetailsPage />} />

      {/* ── Authenticated Dashboard Layout ──────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <ProfileLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home"           element={<HomePage />} />
        <Route path="/profile/info"   element={<ProfileInfoPage />} />
        <Route path="/bookings"       element={<BookingsPage />} />
        <Route path="/messaging"      element={<MessagingPage />} />

        {/* ── Organizer ───────────────────────────────────────────────────── */}
        <Route
          path="/manage-events"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <ManageEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <EditEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-bookings"
          element={
            <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
              <OrganizerBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* ── Admin ───────────────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ── Fallbacks ───────────────────────────────────────────────────── */}
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*"           element={<NotFoundPage />} />
    </Routes>
  );
}
