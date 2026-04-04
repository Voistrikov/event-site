import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listUsers, updateUserStatus } from '../api/adminApi';
import type { ListUsersResponse } from '../api/adminApi';
import type { User, Role, UserStatus } from '../types/user.types';

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
  const [result,   setResult]   = useState<ListUsersResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [filterRole,   setFilterRole]   = useState<Role | ''>('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState<string | null>(null); // userId being updated

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

  const handleStatusUpdate = async (user: User, status: 'APPROVED' | 'REJECTED') => {
    setActing(user.id);
    try {
      await updateUserStatus(user.id, status);
      // Refresh current page
      await load(page);
    } catch {
      setError(`Failed to ${status.toLowerCase()} user.`);
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="profile-page-header">
        <h1 className="profile-page-title">🛡️ Admin Panel</h1>
        <p className="page-subtitle">Manage platform users and their approval status</p>
      </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>
        )}

        <div className="table-card">
          <div className="table-toolbar">
            <span className="table-toolbar-title">Users</span>

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

              <button
                className="btn btn-primary btn-sm"
                onClick={() => load(1)}
                disabled={loading}
              >
                {loading ? 'Loading…' : 'Load Users'}
              </button>
            </div>
          </div>

          {/* Table */}
          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">Press "Load Users" to fetch the user list</div>
            </div>
          )}

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
                            {u.status !== 'APPROVED' && (
                              <button
                                className="btn btn-success btn-sm"
                                disabled={acting === u.id}
                                onClick={() => handleStatusUpdate(u, 'APPROVED')}
                              >
                                Approve
                              </button>
                            )}
                            {u.status !== 'REJECTED' && (
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={acting === u.id}
                                onClick={() => handleStatusUpdate(u, 'REJECTED')}
                              >
                                Reject
                              </button>
                            )}
                            {u.status === 'APPROVED' && u.role === 'ADMIN' && (
                              <span style={{ fontSize: 12, color: '#6b7280' }}>—</span>
                            )}
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

