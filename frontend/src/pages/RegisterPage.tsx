import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';
import type { RegisterFormData } from '../types/user.types';
import axios from 'axios';
import heroImage from '../assets/hero.jpg';

interface RegistrationError { error?: string; code?: string; details?: Record<string, string[]>; }

const INITIAL: RegisterFormData = {
  username: '', password: '', firstName: '', lastName: '',
  email: '', phone: '', address: '', city: '', country: '', taxId: '',
  role: 'ATTENDEE',
};

export default function RegisterPage() {
  const [form, setForm]   = useState<RegisterFormData>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field: keyof RegisterFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: '' }));
      }
      setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/pending-approval', { replace: true });
    } catch (err: unknown) {
      const data = axios.isAxiosError<RegistrationError>(err) ? err.response?.data : undefined;
      if (data) {
        if (data.code === 'VALIDATION_ERROR' && data.details) {
          const errors: Record<string, string> = {};
          for (const key in data.details) {
            errors[key] = data.details[key]?.[0] ?? '';
          }
          setFieldErrors(errors);
        } else if (data.code === 'USERNAME_TAKEN') {
          setFieldErrors({ username: data.error ?? 'Το όνομα χρήστη χρησιμοποιείται ήδη.' });
        } else if (data.code === 'EMAIL_TAKEN') {
          setFieldErrors({ email: data.error ?? 'Το email χρησιμοποιείται ήδη.' });
        } else {
          setError(data.error || 'Η εγγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
        }
      } else {
        setError('Η εγγραφή απέτυχε. Ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.');
      }
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }: { field: string }) => {
    if (!fieldErrors[field]) return null;
    return <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '4px' }}>{fieldErrors[field]}</div>;
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-visual" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>

      <div className="auth-panel">
        <div className="auth-card auth-card-wide">
          <Link to="/" className="auth-brand">
            <h2 className="brand-name">EventHub</h2>
            <p className="brand-tagline">Ανακαλύψτε Εκδηλώσεις</p>
          </Link>

        <h1 className="auth-title">Δημιουργία λογαριασμού</h1>
        <p className="auth-subtitle">Συμπληρώστε τα παρακάτω στοιχεία για να ξεκινήσετε</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Όνομα χρήστη</label>
              <FieldError field="username" />
              <input id="username" className={`form-input ${fieldErrors.username ? 'input-error' : ''}`} value={form.username}
                onChange={set('username')} placeholder="johndoe" 
                minLength={3} maxLength={50} pattern="^\S+$" title="Χωρίς κενά, 3-50 χαρακτήρες" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="role">Είμαι</label>
              <select id="role" className="form-select" value={form.role} onChange={set('role')}>
                <option value="ATTENDEE">Επισκέπτης</option>
                <option value="ORGANIZER">Διοργανωτής</option>
                <option value="ADMIN">Διαχειριστής</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">Όνομα</label>
              <FieldError field="firstName" />
              <input id="firstName" className={`form-input ${fieldErrors.firstName ? 'input-error' : ''}`} value={form.firstName}
                onChange={set('firstName')} placeholder="John" minLength={1} maxLength={100} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Επώνυμο</label>
              <FieldError field="lastName" />
              <input id="lastName" className={`form-input ${fieldErrors.lastName ? 'input-error' : ''}`} value={form.lastName}
                onChange={set('lastName')} placeholder="Doe" minLength={1} maxLength={100} required />
            </div>
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <FieldError field="email" />
            <input id="email" className={`form-input ${fieldErrors.email ? 'input-error' : ''}`} type="email" value={form.email}
              onChange={set('email')} placeholder="john@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Κωδικός πρόσβασης</label>
            <FieldError field="password" />
            <input id="reg-password" className={`form-input ${fieldErrors.password ? 'input-error' : ''}`} type="password" value={form.password}
              onChange={set('password')} placeholder="Τουλάχιστον 8 χαρακτήρες, 1 κεφαλαίο, 1 αριθμός"
              minLength={8} pattern="^(?=.*[A-Z])(?=.*\d).+$" title="Τουλάχιστον 8 χαρακτήρες, 1 κεφαλαίο, 1 αριθμός"
              autoComplete="new-password" required />
          </div>

          {/* Row 4 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Τηλέφωνο</label>
              <FieldError field="phone" />
              <input id="phone" className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`} type="tel" value={form.phone}
                onChange={set('phone')} placeholder="+30 210 0000000" minLength={7} maxLength={20} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="taxId">ΑΦΜ</label>
              <FieldError field="taxId" />
              <input id="taxId" className={`form-input ${fieldErrors.taxId ? 'input-error' : ''}`} value={form.taxId}
                onChange={set('taxId')} placeholder="123456789" minLength={1} maxLength={20} required />
            </div>
          </div>

          {/* Row 5 */}
          <div className="form-group">
            <label className="form-label" htmlFor="address">Διεύθυνση</label>
            <FieldError field="address" />
            <input id="address" className={`form-input ${fieldErrors.address ? 'input-error' : ''}`} value={form.address}
              onChange={set('address')} placeholder="123 Main St" minLength={1} maxLength={200} required />
          </div>

          <div className="form-row">
            <div className="form-group">
            <label className="form-label" htmlFor="city">Πόλη</label>
              <FieldError field="city" />
              <input id="city" className={`form-input ${fieldErrors.city ? 'input-error' : ''}`} value={form.city}
                onChange={set('city')} placeholder="Athens" minLength={1} maxLength={100} required />
            </div>
            <div className="form-group">
            <label className="form-label" htmlFor="country">Κωδικός χώρας</label>
              <FieldError field="country" />
              <input id="country" className={`form-input ${fieldErrors.country ? 'input-error' : ''}`} value={form.country}
                onChange={set('country')} placeholder="GR" minLength={2} maxLength={100} required />
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Link to="/" className="btn btn-lg" style={{ flex: 1, textAlign: 'center', backgroundColor: '#e2e8f0', color: '#334155' }}>
              Ακύρωση
            </Link>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Δημιουργία λογαριασμού…' : 'Δημιουργία λογαριασμού'}
            </button>
          </div>
        </form>

        <p className="auth-footer">
          Έχετε ήδη λογαριασμό; <Link to="/login">Σύνδεση</Link>
        </p>
        </div>
      </div>
    </div>
  );
}
