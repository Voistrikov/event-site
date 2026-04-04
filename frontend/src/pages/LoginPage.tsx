import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ identifier, password });
      const user = useAuthStore.getState().user;
      if (user?.status === 'PENDING') {
        navigate('/pending-approval', { replace: true });
      } else if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch {
      setError('Invalid username / email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Link to="/" className="auth-logo" style={{ textDecoration: 'none' }}>
          <div className="auth-logo-icon">E</div>
          <span className="auth-logo-text">EventApp</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Username or Email</label>
            <input
              id="identifier"
              className="form-input"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="username or email@example.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Link to="/" className="btn btn-lg" style={{ flex: 1, textAlign: 'center', backgroundColor: '#e2e8f0', color: '#334155' }}>
              Cancel
            </Link>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

