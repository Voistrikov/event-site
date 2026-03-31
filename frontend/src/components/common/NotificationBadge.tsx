import { useNotificationStore } from '../../store/notificationStore';
import { Link } from 'react-router-dom';

export default function NotificationBadge() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <Link to="/messages" className="notification-badge">
      Messages
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </Link>
  );
}
