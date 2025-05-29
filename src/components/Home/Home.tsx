import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { fetchPopularMovies, fetchUpcomingMovies } from '../../api';
import Cards from '../Cards/Cards';
import { useNavigate } from 'react-router-dom';
import { useIsWide } from '../../Context/AspectRationContext';

const Home: React.FC = () => {
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'now' | 'upcoming'>('now');
  const [numMoviesToShow, setNumMoviesToShow] = useState(6);
  const navigate = useNavigate();
  const isWide = useIsWide();  // Εδώ παίρνεις το boolean για το πλάτος οθόνης

  useEffect(() => {
    fetchPopularMovies().then(data => setPopularMovies(data.results || []));
    fetchUpcomingMovies().then(data => setUpcomingMovies(data.results || []));
  }, []);

  // Εμφάνιση ταινιών με βάση το ενεργό tab και το πλήθος που θέλουμε να δείξουμε
  const displayedMovies =
    activeTab === 'now'
      ? popularMovies.slice(0, numMoviesToShow)
      : upcomingMovies.slice(0, numMoviesToShow);

  // Αύξηση πλήθους ταινιών
  const handleShowMore = () => {
    setNumMoviesToShow(prev => prev + 6);
  };

  // Επαναφορά πλήθους όταν αλλάζουμε tab
  useEffect(() => {
    setNumMoviesToShow(6);
  }, [activeTab]);

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

      <div className={styles.capacityPanel}>
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

      <div
        className={styles.cardsPageGrid}
        style={{
          gridTemplateColumns: isWide
            ? 'repeat(6, 1fr)'
            : window.innerWidth > 480
            ? 'repeat(3, 1fr)'
            : 'repeat(1, 1fr)'
        }}
      >
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
