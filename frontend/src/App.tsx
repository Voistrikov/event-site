import { useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import WelcomePage        from './pages/WelcomePage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import EventsPage         from './pages/EventsPage';
import BookingsPage       from './pages/BookingsPage';
import MessagingPage      from './pages/MessagingPage';
import ManageEventsPage   from './pages/ManageEventsPage';
import CreateEventPage    from './pages/CreateEventPage';
import EditEventPage      from './pages/EditEventPage';
import AdminPage          from './pages/AdminPage';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import NotFoundPage       from './pages/NotFoundPage';
import EventsAppLayout from './components/layout/EventsAppLayout';
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
      <Route path="/events"            element={<Navigate to="/search" replace />} />
      <Route path="/events/:id"        element={<EventDetailsPage />} />

      {/* ── Shared events-style application shell ───────────────────────── */}
      <Route element={<EventsAppLayout />}>
        <Route path="/search" element={<EventsPage />} />
        <Route path="/home" element={<ProtectedRoute><Navigate to="/search" replace /></ProtectedRoute>} />
        <Route path="/profile/info" element={<ProtectedRoute><ProfileInfoPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/messaging" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />

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
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUserDetailsPage />
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
