import { Link } from 'react-router-dom';
import '../styles/PendingApprovalPage.css';

export default function PendingApprovalPage() {
  return (
    <div className="pending-approval-page">
      <div className="pending-approval-card">
        <Link to="/" className="auth-brand" style={{ marginBottom: '24px' }}>
          <h2 className="brand-name">EventHub</h2>
          <p className="brand-tagline">Ανακαλύψτε Εκδηλώσεις</p>
        </Link>
        <div className="pending-approval-icon" aria-hidden="true">⏳</div>
        <h1 className="pending-approval-title">Εκκρεμεί Έγκριση</h1>
        <p className="pending-approval-description">
          Η αίτηση εγγραφής σας καταχωρήθηκε με επιτυχία και εκκρεμεί η έγκρισή της από τον διαχειριστή.
        </p>
        <div>
          <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px' }}>
            Επιστροφή στην Αρχική
          </Link>
        </div>
      </div>
    </div>
  );
}
