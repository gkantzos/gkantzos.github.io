import React, { useEffect, useState, JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../../api';
import { ArrowLeft, Clock, Star, MapPin } from 'lucide-react';
import styles from './BookingPage.module.css';
import AuthModal from '../../components/Auth/AuthModal';
import { useAuth } from '../../Context/AuthContext';

interface Show {
  _id: string;
  movieId: number;
  date: string;
  time: string;
  hall: string;
  seats: boolean[];
}

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  runtime: number;
  vote_average: number;
  genres: { id: number; name: string }[];
}

// Seat SVG icon
const SeatIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="10" width="18" height="9" rx="2" />
    <rect x="5" y="7" width="14" height="5" rx="2" />
    <rect x="3" y="17" width="3" height="4" rx="1" />
    <rect x="18" y="17" width="3" height="4" rx="1" />
  </svg>
);

const cinemaLayouts: Record<string, {
  name: string;
  location: string;
  rows: number;
  leftSeats: number;
  centerSeats: number;
  rightSeats: number;
}> = {
  StarAvenue: {
    name: 'Star Avenue',
    location: 'Los Angeles',
    rows: 18,
    leftSeats: 3,
    centerSeats: 11,
    rightSeats: 3,
  },
  CinemaBlvd: {
    name: 'Cinema Boulevard',
    location: 'New York',
    rows: 16,
    leftSeats: 3,
    centerSeats: 11,
    rightSeats: 3,
  }
};

const ROWS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];

const BookingPage: React.FC = () => {
  const { cinemaName, movieId } = useParams<{ cinemaName: string; movieId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();

  const [shows, setShows] = useState<Show[]>([]);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [booking, setBooking] = useState<{
    date: string; time: string; hall: string; seat: string; reward?: string
  } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [rewardCode, setRewardCode] = useState('');
  const [achievementNotifications, setAchievementNotifications] = useState<{ name: string; reward: { name: string } | null }[]>([]);

  const layout = cinemaName ? cinemaLayouts[cinemaName] : null;

  useEffect(() => {
    if (!movieId || !cinemaName) return;
    const fetchData = async () => {
      try {
        const movieData = await fetchMovieDetails(parseInt(movieId));
        setMovie(movieData);

        const res = await fetch(`http://localhost:4000/api/shows?cinema=${cinemaName}&movieId=${movieId}`);
        const data = await res.json();

        const sorted = data.shows.sort((a: Show, b: Show) =>
          new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
        );
        setShows(sorted);

        const dates = Array.from(new Set(sorted.map((s: Show) => s.date))) as string[];
        setAvailableDates(dates);

        const today = new Date().toISOString().split('T')[0];
        const validDate = dates.find(d => d >= today) || dates[0];
        setSelectedDate(validDate);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchData();
  }, [cinemaName, movieId]);

  useEffect(() => {
    if (selectedDate && shows.length > 0) {
      setFilteredShows(shows.filter(s => s.date === selectedDate));
      setSelectedShow(null);
    }
  }, [selectedDate, shows]);

  const formatDate = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (dateString === today) return 'Σήμερα';
    if (dateString === tomorrowStr) return 'Αύριο';
    return new Date(dateString).toLocaleDateString('el-GR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  };

  const getAvailableSeats = (seats: boolean[]) => seats.filter(s => s).length;

  const getSeatLabel = (seatIndex: number): string => {
    if (!layout) return '';
    const seatsPerRow = layout.leftSeats + layout.centerSeats + layout.rightSeats;
    const row = Math.floor(seatIndex / seatsPerRow);
    const col = (seatIndex % seatsPerRow) + 1;
    return `${ROWS[row]}-${col}`;
  };

  const bookSelectedSeats = async (authenticationToken?: string) => {
    if (!selectedShow || selectedSeats.length === 0) return;

    setBookingInProgress(true);
    setBookingError('');
    try {
      const res = await fetch(`http://localhost:4000/api/shows/${selectedShow._id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...((authenticationToken || token) ? { Authorization: `Bearer ${authenticationToken || token}` } : {})
        },
        body: JSON.stringify({
          seatIndexes: selectedSeats,
          rewardCode: rewardCode.trim() || undefined,
          movieId: movie?.id,
          movieTitle: movie?.title
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          const unavailableShow = data.show as Show;
          setShows(currentShows => currentShows.map(show =>
            show._id === unavailableShow._id ? unavailableShow : show
          ));
          setSelectedShow(unavailableShow);
          setSelectedSeats([]);
        }
        throw new Error(data.error || 'Δεν ήταν δυνατή η κράτηση');
      }

      const updatedShow = data.show as Show;
      const latestAchievement = (data.newAchievements || []).at(-1);
      const latestMilestone = (data.milestoneRewards || []).at(-1);
      setAchievementNotifications(latestAchievement ? [latestAchievement] : latestMilestone ? [{
        name: 'Νέο Standard Reward',
        reward: { name: latestMilestone.name }
      }] : []);
      setShows(currentShows => currentShows.map(show =>
        show._id === updatedShow._id ? updatedShow : show
      ));
      setSelectedShow(updatedShow);
      setBooking({
        date: formatDate(updatedShow.date),
        time: updatedShow.time,
        hall: updatedShow.hall,
        seat: selectedSeats.map(getSeatLabel).join(', '),
        reward: data.redeemedReward || undefined
      });
      setShowModal(false);
      setSelectedSeats([]);
      setRewardCode('');
    } catch (err: any) {
      setBookingError(err.message || 'Δεν ήταν δυνατή η κράτηση');
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedShow || selectedSeats.length === 0) return;
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    bookSelectedSeats();
  };

  const renderSeats = (): JSX.Element[] => {
    if (!selectedShow || !layout) return [];
    const seats = selectedShow.seats;
    const { rows, leftSeats, centerSeats, rightSeats } = layout;
    const seatsPerRow = leftSeats + centerSeats + rightSeats;
    const rowElements: JSX.Element[] = [];

    for (let r = 0; r < rows; r++) {
      const rowSeats: JSX.Element[] = [];
      const scale = 0.85 + (r / rows) * 0.15;

      // Left seats
      for (let s = 0; s < leftSeats; s++) {
        const idx = r * seatsPerRow + s;
        const isAvailable = seats[idx];
        const isSelected = selectedSeats.includes(idx);
        rowSeats.push(
          <button
            key={`l-${idx}`}
            className={[styles.seat, isSelected ? styles.selected : isAvailable ? styles.available : styles.taken].join(' ')}
            onClick={() => isAvailable && setSelectedSeats(current =>
              isSelected ? current.filter(seat => seat !== idx) : [...current, idx]
            )}
            disabled={!isAvailable}
            title={getSeatLabel(idx)}
          >
            <SeatIcon color={isSelected ? '#fff' : isAvailable ? '#00bcd4' : '#862c2c'} />
          </button>
        );
      }

      // Left aisle
      rowSeats.push(<div key={`al-${r}`} className={styles.aisle} />);

      // Center seats
      for (let s = 0; s < centerSeats; s++) {
        const idx = r * seatsPerRow + leftSeats + s;
        const isAvailable = seats[idx];
        const isSelected = selectedSeats.includes(idx);
        rowSeats.push(
          <button
            key={`c-${idx}`}
            className={[styles.seat, isSelected ? styles.selected : isAvailable ? styles.available : styles.taken].join(' ')}
            onClick={() => isAvailable && setSelectedSeats(current =>
              isSelected ? current.filter(seat => seat !== idx) : [...current, idx]
            )}
            disabled={!isAvailable}
            title={getSeatLabel(idx)}
          >
            <SeatIcon color={isSelected ? '#fff' : isAvailable ? '#00bcd4' : '#862c2c'} />
          </button>
        );
      }

      // Right aisle
      rowSeats.push(<div key={`ar-${r}`} className={styles.aisle} />);

      // Right seats
      for (let s = 0; s < rightSeats; s++) {
        const idx = r * seatsPerRow + leftSeats + centerSeats + s;
        const isAvailable = seats[idx];
        const isSelected = selectedSeats.includes(idx);
        rowSeats.push(
          <button
            key={`r-${idx}`}
            className={[styles.seat, isSelected ? styles.selected : isAvailable ? styles.available : styles.taken].join(' ')}
            onClick={() => isAvailable && setSelectedSeats(current =>
              isSelected ? current.filter(seat => seat !== idx) : [...current, idx]
            )}
            disabled={!isAvailable}
            title={getSeatLabel(idx)}
          >
            <SeatIcon color={isSelected ? '#fff' : isAvailable ? '#00bcd4' : '#862c2c'} />
          </button>
        );
      }

      rowElements.push(
        <div
          key={r}
          className={styles.seatRow}
          style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
        >
          <span className={styles.rowLabel}>{ROWS[r]}</span>
          {rowSeats}
        </div>
      );
    }
    return rowElements;
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );

  return (
    <div className={styles.bookingBackground}>

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Πίσω
        </button>
        <div>
          <div className={styles.headerTitle}>Κράτηση Εισιτηρίων</div>
          <div className={styles.headerSubtitle}>
            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
            {layout?.name} — {layout?.location}
          </div>
        </div>
      </div>

      {/* Movie Card */}
      {movie && (
        <div className={styles.movieCard}>
          <img
            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
            alt={movie.title}
            className={styles.moviePoster}
          />
          <div className={styles.movieInfo}>
            <div className={styles.movieTitle}>{movie.title}</div>
            <div className={styles.movieMeta}>
              <span><Clock size={14} /> {movie.runtime} λεπτά</span>
              <span><Star size={14} color="#FFD700" /> {movie.vote_average.toFixed(1)}</span>
            </div>
            <div className={styles.cinemaName}>{layout?.name} · {layout?.location}</div>
          </div>
        </div>
      )}

      {/* Booking Summary */}
      {booking && (
        <div className={styles.summary}>
          <div className={styles.summaryTitle}>✅ Κράτηση Επιβεβαιώθηκε!</div>
          <div className={styles.summaryDetails}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Ημερομηνία</span>
              <span className={styles.summaryValue}>{booking.date}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Ώρα</span>
              <span className={styles.summaryValue}>{booking.time}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Αίθουσα</span>
              <span className={styles.summaryValue}>{booking.hall}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Θέση</span>
              <span className={styles.summaryValue}>{booking.seat}</span>
            </div>
            {booking.reward && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Reward</span>
                <span className={styles.summaryValue}>{booking.reward} χρησιμοποιήθηκε</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Επιλέξτε Ημερομηνία</div>
        <div className={styles.dateGrid}>
          {availableDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={[styles.dateButton, date === selectedDate ? styles.selected : ''].join(' ')}
            >
              <div className={styles.dateLabel}>{formatDate(date)}</div>
              <div className={styles.dateValue}>
                {new Date(date).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shows */}
      {selectedDate && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Ώρες Προβολής</div>
          <div className={styles.showsGrid}>
            {filteredShows.map(show => (
              <div
                key={show._id}
                className={[styles.showCard, selectedShow?._id === show._id ? styles.selectedShow : ''].join(' ')}
                onClick={() => setSelectedShow(show)}
              >
                <div className={styles.showInfo}>
                  <div className={styles.showTime}>{show.time}</div>
                  <div>
                    <div className={styles.showHall}>{show.hall}</div>
                    <div className={styles.showSeats}>
                      {getAvailableSeats(show.seats)} διαθέσιμες θέσεις
                    </div>
                  </div>
                </div>
                <button
                  className={styles.selectButton}
                  disabled={getAvailableSeats(show.seats) === 0}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedShow(show);
                    setShowModal(true);
                    setSelectedSeats([]);
                    setBookingError('');
                    setRewardCode('');
                  }}
                >
                  {getAvailableSeats(show.seats) === 0 ? 'Εξαντλημένο' : 'Επιλογή Θέσεων'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedShow && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {selectedShow.time} — {selectedShow.hall}
              </div>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Screen */}
            <div className={styles.screenWrapper}>
              <div className={styles.screen} />
            </div>
            <div className={styles.screenLabel}>ΟΘΟΝΗ</div>

            {/* Legend */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.available}`}>
                  <SeatIcon color="#00bcd4" />
                </div>
                Διαθέσιμη
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.selected}`}>
                  <SeatIcon color="#fff" />
                </div>
                Επιλεγμένη
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendSeat} ${styles.taken}`}>
                  <SeatIcon color="#862c2c" />
                </div>
                Κατειλημμένη
              </div>
            </div>

            {/* Seats */}
            <div className={styles.seatsContainer}>
              {renderSeats()}
            </div>

            {isLoggedIn && (
              <div className={styles.rewardCodeBox}>
                <label htmlFor="reward-code">Έχεις reward code;</label>
                <input
                  id="reward-code"
                  value={rewardCode}
                  onChange={event => setRewardCode(event.target.value.toUpperCase())}
                  placeholder="MOVIE-..."
                />
                <span>Ο κωδικός ελέγχεται κατά την επιβεβαίωση.</span>
              </div>
            )}

            {bookingError && <div className={styles.bookingError}>{bookingError}</div>}

            <button
              className={styles.confirmButton}
              disabled={selectedSeats.length === 0 || bookingInProgress}
              onClick={handleConfirm}
            >
              {bookingInProgress
                ? 'Γίνεται κράτηση...'
                : selectedSeats.length === 0
                ? 'Επιλέξτε θέση'
                : `Επιβεβαίωση — ${selectedSeats.length} ${selectedSeats.length === 1 ? 'θέση' : 'θέσεις'}`}
            </button>
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal
          showGuest
          onClose={() => setShowAuth(false)}
          onAuthenticated={(authenticationToken) => {
            setShowAuth(false);
            bookSelectedSeats(authenticationToken);
          }}
          onGuest={() => {
            setShowAuth(false);
            bookSelectedSeats();
          }}
        />
      )}

      {achievementNotifications.length > 0 && (
        <div className={styles.achievementToast}>
          <button onClick={() => setAchievementNotifications([])}>×</button>
          <strong>🎉 Νέο Achievement!</strong>
          {achievementNotifications.map(achievement => (
            <span key={achievement.name}>{achievement.name}{achievement.reward ? ` — ${achievement.reward.name}` : ''}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingPage;
