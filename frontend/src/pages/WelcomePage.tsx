import { Link } from 'react-router-dom';

export default function WelcomePage() {
  return (
    <div className="welcome-page">
      <h1>Welcome to Events Platform</h1>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  );
}
