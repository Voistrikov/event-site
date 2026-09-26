import { Outlet } from 'react-router-dom';
import EventsNavbar from './EventsNavbar';
import './EventsAppLayout.css';

export default function EventsAppLayout() {
  return (
    <div className="events-page">
      <EventsNavbar />
      <Outlet />
    </div>
  );
}
