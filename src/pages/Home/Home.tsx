import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { fetchPopularMovies, fetchUpcomingMovies } from '../../api';
import Cards from '../../components/Cards/Cards';
import { useNavigate } from 'react-router-dom';
import { useScreen } from '../../Context/ResponsiveContext';
import { useAuth } from '../../Context/AuthContext';
import AuthModal from '../../components/Auth/AuthModal';

const Home: React.FC = () => {
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'now' | 'upcoming'>('now');
  const [numMoviesToShow, setNumMoviesToShow] = useState(6);
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, isUltrawide, isWide } = useScreen();
  const { isLoggedIn, token } = useAuth();
  const [favoriteMovieIds, setFavoriteMovieIds] = useState<number[]>([]);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetchPopularMovies().then(data => setPopularMovies(data.results || []));
    fetchUpcomingMovies().then(data => setUpcomingMovies(data.results || []));
  }, []);

  useEffect(() => {
    if (!token) { setFavoriteMovieIds([]); return; }
    fetch('http://localhost:4000/api/auth/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setFavoriteMovieIds(data.favoriteMovieIds || []))
      .catch(() => setFavoriteMovieIds([]));
  }, [token]);

  // Αρχικός αριθμός ταινιών που θα εμφανίζονται, ανάλογα με το μέγεθος οθόνης
  const getInitialMoviesCount = () => {
    if (isMobile) return 4;       // Mobile: αρχικά 2 ταινίες κάθετα
    if (isTablet) return 4;       // Tablet: 6 οριζόντια
    if (isDesktop) return 6;      // Desktop: 8 οριζόντια
    if (isUltrawide) return 6;   // Ultrawide: 12 οριζόντια
    return 6;
  };

  // Ενημερώνουμε το πλήθος εμφάνισης όταν αλλάζει το tab ή το μέγεθος οθόνης
  useEffect(() => {
    setNumMoviesToShow(getInitialMoviesCount());
  }, [activeTab, isMobile, isTablet, isDesktop, isUltrawide]);

  // Ταινίες που εμφανίζονται ανάλογα με tab και αριθμό
  const displayedMovies =
    activeTab === 'now'
      ? popularMovies.slice(0, numMoviesToShow)
      : upcomingMovies.slice(0, numMoviesToShow);

  // Λειτουργία "LOAD MORE"
  const handleShowMore = () => {
    const increment = isMobile ? 4 : isTablet ? 4 : isDesktop ? 4 : 6;
    setNumMoviesToShow(prev => prev + increment);
  };

  const toggleFavorite = async (id: number) => {
    if (!isLoggedIn || !token) { setShowAuth(true); return; }
    const isFavorite = favoriteMovieIds.includes(id);
    const res = await fetch(`http://localhost:4000/api/auth/favorites/${id}`, {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setFavoriteMovieIds(data.favoriteMovieIds || []);
  };

  return (
    <section className={styles.homeSection}>
      <div className={styles.mainContent}>
        <h1>Welcome to MovieTime Cinemas</h1>
        <p>
          Experience the ultimate cinematic journey with premium Dolby Atmos sound and 8K screenings. MovieTime Cinemas offer you the comfort, quality, and entertainment you truly deserve.
        </p>
        <button
          className={styles.bookingButton}
          onClick={() => navigate('/movies')}
        >
          Book a Ticket
        </button>
      </div>

      <div className={styles.capacityWrapper}>
        <div className={styles.capacityPanel}>
          <div className={styles.capacityCard}>
            <h2>Star Avenue</h2>
            <p className={styles.seats}>2757 Seats</p>
            <p className={styles.halls}>9 Halls</p>
          </div>
        </div>
        <div className={styles.capacityPanel}>
          <div className={styles.capacityCard}>
            <h2>Cinema Boulevard</h2>
            <p className={styles.seats}>2192 Seats</p>
            <p className={styles.halls}>8 Halls</p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'now' ? styles.active : ''}`}
          onClick={() => setActiveTab('now')}
        >
          PLAYING NOW
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.active : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          UPCOMING
        </button>
      </div>

      {/* Κάρτες ταινιών */}
      <div
        className={`${styles.cardsPageGrid} ${
          isMobile ? styles.verticalList : styles.horizontalGrid
        }`}
      >
        <Cards
          movies={displayedMovies}
          onCardClick={(id) => navigate(`/movie/${id}`)}
          favoriteMovieIds={favoriteMovieIds}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      {/* Κουμπί LOAD MORE αν υπάρχουν ακόμα ταινίες */}
      {((activeTab === 'now' && numMoviesToShow < popularMovies.length) ||
        (activeTab === 'upcoming' && numMoviesToShow < upcomingMovies.length)) && (
        <div className={styles.showMoreContainer}>
          <button onClick={handleShowMore} className={styles.showMoreButton}>
            LOAD MORE...
          </button>
        </div>
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </section>
  );
};

export default Home;
