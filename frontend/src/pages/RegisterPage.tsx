import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';
import type { RegisterFormData } from '../types/user.types';

const INITIAL: RegisterFormData = {
  username: '', password: '', firstName: '', lastName: '',
  email: '', phone: '', address: '', city: '', country: '', taxId: '',
  role: 'ATTENDEE',
};

export default function RegisterPage() {
  const [form, setForm]   = useState<RegisterFormData>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field: keyof RegisterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Registration failed. Please check your details and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <div className="auth-logo-icon">E</div>
          <span className="auth-logo-text">EventApp</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Fill in the details below to get started</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input id="username" className="form-input" value={form.username}
                onChange={set('username')} placeholder="johndoe" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="role">I am an</label>
              <select id="role" className="form-select" value={form.role} onChange={set('role')}>
                <option value="ATTENDEE">Attendee</option>
                <option value="ORGANIZER">Organizer</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input id="firstName" className="form-input" value={form.firstName}
                onChange={set('firstName')} placeholder="John" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input id="lastName" className="form-input" value={form.lastName}
                onChange={set('lastName')} placeholder="Doe" required />
            </div>
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" className="form-input" type="email" value={form.email}
              onChange={set('email')} placeholder="john@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" className="form-input" type="password" value={form.password}
              onChange={set('password')} placeholder="Min 8 chars, 1 uppercase, 1 digit"
              autoComplete="new-password" required />
          </div>

          {/* Row 4 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input id="phone" className="form-input" type="tel" value={form.phone}
                onChange={set('phone')} placeholder="+30 210 0000000" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="taxId">Tax ID (ΑΦΜ)</label>
              <input id="taxId" className="form-input" value={form.taxId}
                onChange={set('taxId')} placeholder="123456789" required />
            </div>
          </div>

          {/* Row 5 */}
          <div className="form-group">
            <label className="form-label" htmlFor="address">Address</label>
            <input id="address" className="form-input" value={form.address}
              onChange={set('address')} placeholder="123 Main St" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input id="city" className="form-input" value={form.city}
                onChange={set('city')} placeholder="Athens" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="country">Country Code</label>
              <input id="country" className="form-input" value={form.country}
                onChange={set('country')} placeholder="GR" maxLength={2} required />
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

