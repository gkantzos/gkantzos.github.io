import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, MapPin, Ticket, XCircle } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import styles from './MyBookings.module.css';

interface Booking {
  _id: string;
  movieTitle: string;
  cinemaId: string;
  hall: string;
  date: string;
  time: string;
  seatIndexes: number[];
  rewardName?: string;
  status: 'confirmed' | 'cancelled';
}

const seatLabel = (index: number) => `${String.fromCharCode(65 + Math.floor(index / 17))}-${(index % 17) + 1}`;

const MyBookings: React.FC = () => {
  const { isLoggedIn, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!token) return;
    const res = await fetch('http://localhost:4000/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setBookings(data.bookings);
  }, [token]);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    loadBookings().catch(error => setMessage(error.message)).finally(() => setLoading(false));
  }, [isLoggedIn, loadBookings]);

  const cancelBooking = async (id: string) => {
    if (!token || !window.confirm('Θέλετε σίγουρα να ακυρώσετε την κράτηση;')) return;
    const res = await fetch(`http://localhost:4000/api/bookings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error); return; }
    setBookings(current => current.map(booking => booking._id === id ? data.booking : booking));
  };

  if (!isLoggedIn) return <section className={styles.page}><div className={styles.empty}><Ticket size={42} /><h1>Οι κρατήσεις μου</h1><p>Συνδεθείτε για να δείτε το ιστορικό σας.</p></div></section>;
  if (loading) return <section className={styles.page}><div className={styles.empty}>Φόρτωση κρατήσεων...</div></section>;

  return <section className={styles.page}>
    <header><p>MY MOVIETIME</p><h1>Οι κρατήσεις μου</h1></header>
    {message && <p className={styles.message}>{message}</p>}
    {bookings.length === 0 ? <div className={styles.empty}><Ticket size={42} /><p>Δεν έχετε κάνει ακόμη κρατήσεις.</p></div> : <div className={styles.list}>
      {bookings.map(booking => <article className={`${styles.card} ${booking.status === 'cancelled' ? styles.cancelled : ''}`} key={booking._id}>
        <div className={styles.ticketIcon}><Ticket /></div><div className={styles.info}><h2>{booking.movieTitle}</h2><p><MapPin size={15} /> {booking.cinemaId} · {booking.hall}</p><p><CalendarDays size={15} /> {new Date(booking.date).toLocaleDateString('el-GR')} · {booking.time}</p><p className={styles.seats}>Θέσεις: {booking.seatIndexes.map(seatLabel).join(', ')}</p>{booking.rewardName && <small>Reward: {booking.rewardName}</small>}</div>
        <div className={styles.actions}>{booking.status === 'confirmed' ? <button onClick={() => cancelBooking(booking._id)}><XCircle size={16} /> Ακύρωση</button> : <span>Ακυρώθηκε</span>}</div>
      </article>)}
    </div>}
  </section>;
};

export default MyBookings;
