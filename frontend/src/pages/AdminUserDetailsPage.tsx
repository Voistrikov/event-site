import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserDetails, updateUserStatus } from '../api/adminApi';
import type { User, UserStatus, Role } from '../types/user.types';

function StatusBadge({ status }: { status: UserStatus }) {
  const cls = status === 'APPROVED' ? 'badge badge-approved'
            : status === 'PENDING'  ? 'badge badge-pending'
            : 'badge badge-rejected';
  return <span className={cls} style={{ marginLeft: 8 }}>{status}</span>;
}

function RoleBadge({ role }: { role: Role }) {
  const cls = role === 'ADMIN' ? 'badge badge-admin'
            : role === 'ORGANIZER' ? 'badge badge-organizer'
            : 'badge badge-attendee';
  return <span className={cls}>{role}</span>;
}

export default function AdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    
    async function load() {
      try {
        const res = await getUserDetails(id!);
        if (isMounted) {
          setUser(res.data.user);
        }
      } catch {
        if (isMounted) setError('Failed to load user details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    load();
    return () => { isMounted = false; };
  }, [id]);

  const handleStatusUpdate = async (status: 'APPROVED' | 'REJECTED') => {
    if (!user) return;
    setActing(true);
    try {
      const res = await updateUserStatus(user.id, status);
      setUser(res.data.user);
    } catch {
      setError(`Failed to ${status.toLowerCase()} user.`);
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '50px auto' }} />;

  if (error || !user) {
    return (
      <div className="admin-page">
        <div className="alert alert-error">{error || 'User not found.'}</div>
        <Link to="/admin" className="btn btn-secondary" style={{ marginTop: 16, display: 'inline-block' }}>
          ← Back to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="profile-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to="/admin" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
            ← Back to Users List
          </Link>
          <h1 className="profile-page-title">
            Λεπτομέρειες Χρήστη: {user.username}
            <StatusBadge status={user.status} />
          </h1>
          <p className="page-subtitle">Διαχείριση και Έλεγχος Στοιχείων Λογαριασμού</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {user.status !== 'APPROVED' && (
            <button
              className="btn btn-success"
              disabled={acting}
              onClick={() => handleStatusUpdate('APPROVED')}
            >
              ✓ Approve
            </button>
          )}
          {user.status !== 'REJECTED' && (
            <button
              className="btn btn-danger"
              disabled={acting}
              onClick={() => handleStatusUpdate('REJECTED')}
            >
              ✕ Reject
            </button>
          )}
        </div>
      </div>

      <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="info-card">
          <h3 className="info-card-title">Βασικά Στοιχεία</h3>
          <div className="info-card-content">
            <div className="info-row">
              <span className="info-label">ID:</span>
              <span className="info-value" style={{ fontFamily: 'monospace' }}>{user.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Όνομα:</span>
              <span className="info-value">{user.firstName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Επίθετο:</span>
              <span className="info-value">{user.lastName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Username:</span>
              <span className="info-value">@{user.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ρόλος:</span>
              <span className="info-value"><RoleBadge role={user.role} /></span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3 className="info-card-title">Επικοινωνία & Τοποθεσία</h3>
          <div className="info-card-content">
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Τηλέφωνο:</span>
              <span className="info-value">{user.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Διεύθυνση:</span>
              <span className="info-value">{user.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Πόλη:</span>
              <span className="info-value">{user.city}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Χώρα (Code):</span>
              <span className="info-value">{user.country}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3 className="info-card-title">Νομικά / Επιπλέον Στοιχεία</h3>
          <div className="info-card-content">
            <div className="info-row">
              <span className="info-label">ΑΦΜ / Tax ID:</span>
              <span className="info-value">{user.taxId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ημερ. Εγγραφής:</span>
              <span className="info-value">{new Date(user.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Τελευταία Ενημέρωση:</span>
              <span className="info-value">{new Date(user.updatedAt).toLocaleString()}</span>
            </div>
            {user.latitude != null && user.longitude != null && (
              <div className="info-row">
                <span className="info-label">Συντεταγμένες:</span>
                <span className="info-value">{user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
