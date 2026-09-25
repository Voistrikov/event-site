import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { getOrganizerBookings } from '../api/bookingsApi';
import type { Booking } from '../types/booking.types';
import OrganizerBookingList from '../components/bookings/OrganizerBookingList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/BookingsPage.css';

export default function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getOrganizerBookings()
      .then((res: AxiosResponse<Booking[]>) => { 
        setBookings(res.data); 
      })
      .catch((err) => {
        console.error('Failed to load organizer bookings', err);
        setBookings([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bookings-page-container">
      <div className="bookings-header">
        <h1 className="bookings-title">Κρατήσεις Εκδηλώσεων</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bookings-empty-state">
          <h2>Δεν υπάρχουν κρατήσεις</h2>
          <p>Οι κρατήσεις για τις εκδηλώσεις σας θα εμφανιστούν εδώ.</p>
        </div>
      ) : (
        <OrganizerBookingList bookings={bookings} />
      )}
    </div>
  );
}
