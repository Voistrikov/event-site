import RecommendedEvents from '../components/recommendations/RecommendedEvents';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <h1>Welcome back{user ? `, ${user.name}` : ''}!</h1>
      <RecommendedEvents />
    </div>
  );
}
