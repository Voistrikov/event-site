import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>404 — Page Not Found</h1>
      <Link to="/">Go home</Link>
    </div>
  );
}
