import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { fetchPopularMovies, fetchUpcomingMovies } from '../../api';
import Cards from '../Cards/Cards';
import { useNavigate } from 'react-router-dom';
import { useScreen } from '../../Context/ResponsiveContext';

const Home: React.FC = () => {
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'now' | 'upcoming'>('now');
  const [numMoviesToShow, setNumMoviesToShow] = useState(6);
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, isUltrawide, isWide } = useScreen();

  useEffect(() => {
    fetchPopularMovies().then(data => setPopularMovies(data.results || []));
    fetchUpcomingMovies().then(data => setUpcomingMovies(data.results || []));
  }, []);

  // Καθορίζουμε πόσες ταινίες να δείχνουμε αρχικά με βάση το screen size
  const getInitialMoviesCount = () => {
    if (isMobile) return 4;
    if (isTablet) return 6;
    if (isDesktop) return 8;
    if (isUltrawide) return 12;
    return 6;
  };

  // Εμφάνιση ταινιών με βάση το ενεργό tab και το πλήθος που θέλουμε να δείξουμε
  const displayedMovies =
    activeTab === 'now'
      ? popularMovies.slice(0, numMoviesToShow)
      : upcomingMovies.slice(0, numMoviesToShow);

  // Αύξηση πλήθους ταινιών
  const handleShowMore = () => {
    const increment = isMobile ? 2 : isTablet ? 3 : isDesktop ? 4 : 6;
    setNumMoviesToShow(prev => prev + increment);
  };

  // Επαναφορά πλήθους όταν αλλάζουμε tab ή screen size
  useEffect(() => {
    setNumMoviesToShow(getInitialMoviesCount());
  }, [activeTab, isMobile, isTablet, isDesktop, isUltrawide]);

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

      <div 
        className={styles.capacityPanel}
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-start',
          marginRight: isMobile ? '0' : '100px',
          gap: isMobile ? '10px' : '20px'
        }}
      >
        <div className={styles.capacityCard}>
          <h2>Star Avenue</h2>
          <p className={styles.seats}>2757 Seats</p>
          <p className={styles.halls}>9 Halls</p>
        </div>
        <div className={styles.capacityCard}>
          <h2>Cinema Boulevard</h2>
          <p className={styles.seats}>2192 Seats</p>
          <p className={styles.halls}>8 Halls</p>
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

      <div className={styles.cardsPageGrid}>
        <Cards movies={displayedMovies} onCardClick={(id) => navigate(`/movie/${id}`)} />
      </div>

      {((activeTab === 'now' && numMoviesToShow < popularMovies.length) ||
        (activeTab === 'upcoming' && numMoviesToShow < upcomingMovies.length)) && (
        <div className={styles.showMoreContainer}>
          <button onClick={handleShowMore} className={styles.showMoreButton}>
            LOAD MORE...
          </button>
        </div>
      )}
    </section>
  );
};

export default Home;