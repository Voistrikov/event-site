import { Link } from 'react-router-dom';

export default function PendingApprovalPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <h1 className="auth-title">Εκκρεμεί Έγκριση</h1>
        <p className="auth-subtitle" style={{ fontSize: '1.1rem', marginTop: '16px', lineHeight: '1.5' }}>
          Η αίτηση εγγραφής σας καταχωρήθηκε με επιτυχία και εκκρεμεί η έγκρισή της από τον διαχειριστή.
        </p>
        <div style={{ marginTop: '32px' }}>
          <Link to="/" className="btn btn-primary btn-lg" style={{ display: 'inline-block' }}>
            Επιστροφή στην Αρχική
          </Link>
        </div>
      </div>
    </div>
  );
}
