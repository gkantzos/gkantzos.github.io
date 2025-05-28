import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { fetchPopularMovies, fetchUpcomingMovies } from '../../api';
import Cards from '../Cards/Cards';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'now' | 'upcoming'>('now');
  const [numMoviesToShow, setNumMoviesToShow] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularMovies().then(data => setPopularMovies(data.results || []));
    fetchUpcomingMovies().then(data => setUpcomingMovies(data.results || []));
  }, []);

  // Εμφάνιση ταινιών με βάση το ενεργό tab και το πλήθος που θέλουμε να δείξουμε
  const displayedMovies =
    activeTab === 'now'
      ? popularMovies.slice(0, numMoviesToShow)
      : upcomingMovies.slice(0, numMoviesToShow);

  // Αύξηση του πλήθους ταινιών που εμφανίζουμε κάθε φορά που πατάμε το κουμπί
  const handleShowMore = () => {
    setNumMoviesToShow(prev => prev + 5);
  };

  // Επαναφορά του πλήθους όταν αλλάζουμε tab
  useEffect(() => {
    setNumMoviesToShow(5);
  }, [activeTab]);

  return (
    <section className="background">
      <div className={styles.mainContent}>
        <h1>Welcome to MovieTime Cinemas</h1>
        <p>
          Experience the ultimate cinematic journey with premium Dolby Atmos sound and 8K screenings. MovieTime Cinemas offer you the comfort, quality, and entertainment you truly deserve.
        </p>
        <button className={styles.bookingButton}>Book a Ticket</button>
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

      <div className={styles.cardsGrid}>
        <Cards movies={displayedMovies} onCardClick={(id) => navigate(`/movie/${id}`)} />
        {((activeTab === 'now' && numMoviesToShow < popularMovies.length) ||
          (activeTab === 'upcoming' && numMoviesToShow < upcomingMovies.length)) && (
          <div className={styles.showMoreContainer}>
            <button onClick={handleShowMore} className={styles.showMoreButton}>
              Εμφάνιση περισσότερων
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;
