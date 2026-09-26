import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import heroImage from '../assets/hero.jpg';

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
    } catch (err: unknown) {
      const data = axios.isAxiosError<{ error?: string }>(err) ? err.response?.data : undefined;
      const msg = data?.error || 'Λάθος όνομα χρήστη / email ή κωδικός πρόσβασης.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-visual" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <Link to="/" className="auth-brand">
            <h2 className="brand-name">EventHub</h2>
            <p className="brand-tagline">Ανακαλύψτε Εκδηλώσεις</p>
          </Link>

          <h1 className="auth-title">Καλώς ήρθατε</h1>
          <p className="auth-subtitle">Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Όνομα χρήστη ή Email</label>
            <input
              id="identifier"
              className="form-input"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="όνομα χρήστη ή email@example.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Κωδικός πρόσβασης</label>
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
              Ακύρωση
            </Link>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Σύνδεση…' : 'Σύνδεση'}
            </button>
          </div>
          </form>

          <p className="auth-footer">
            Δεν έχετε λογαριασμό; <Link to="/register">Δημιουργήστε έναν</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
