import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { getBookings } from '../api/bookingsApi';
import type { Booking } from '../types/booking.types';
import BookingList from '../components/bookings/BookingList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/BookingsPage.css';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getBookings()
      .then((res: AxiosResponse<Booking[]>) => { 
        setBookings(res.data); 
      })
      .catch((err) => {
        console.error('Failed to load bookings', err);
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
        <h1 className="bookings-title">Οι Κρατήσεις μου</h1>
        <Link to="/events" className="search-cta-btn">
          <span>🔍</span> Αναζήτηση Εκδηλώσεων
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bookings-empty-state">
          <h2>Δεν έχετε καμία κράτηση ακόμα</h2>
          <p>Ανακαλύψτε τις διαθέσιμες εκδηλώσεις και κλείστε τα εισιτήριά σας.</p>
          <Link to="/events" className="search-cta-btn" style={{ display: 'inline-flex' }}>
            <span>🔍</span> Εξερεύνηση
          </Link>
        </div>
      ) : (
        <BookingList bookings={bookings} />
      )}
    </div>
  );
}
