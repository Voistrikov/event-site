import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { getBookings, cancelBooking } from '../api/bookingsApi';
import type { Booking } from '../types/booking.types';
import BookingList from '../components/bookings/BookingList';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getBookings().then((res: AxiosResponse<Booking[]>) => { setBookings(res.data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: string) => {
    await cancelBooking(id);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bookings-page">
      <h1 className="profile-page-title">My Bookings</h1>
      <BookingList bookings={bookings} onCancel={handleCancel} />
    </div>
  );
}
