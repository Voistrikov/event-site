import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { getOrganizerBookings, updateBookingStatus } from '../api/bookingsApi';
import type { Booking } from '../types/booking.types';
import OrganizerBookingList from '../components/bookings/OrganizerBookingList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/BookingsPage.css';

export default function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
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

  const handleUpdateStatus = async (id: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await updateBookingStatus(id, status);
      load();
    } catch (err) {
      console.error('Failed to update booking status', err);
      alert('Αποτυχία ενημέρωσης κατάστασης.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bookings-page-container">
      <div className="bookings-header">
        <h1 className="bookings-title">Διαχείριση Κρατήσεων</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="bookings-empty-state">
          <h2>Δεν υπάρχουν αιτήματα κράτησης</h2>
          <p>Όταν κάποιος χρήστης ζητήσει να μείνει σε ένα από τα σπίτια σας, θα εμφανιστεί εδώ.</p>
        </div>
      ) : (
        <OrganizerBookingList bookings={bookings} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
}
