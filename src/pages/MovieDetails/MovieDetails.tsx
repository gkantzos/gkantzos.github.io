import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, fetchMovieVideos, fetchMovieCredits } from '../../api';
import styles from './MovieDetails.module.css';
import { Star, Hourglass, Heart } from 'lucide-react';
import { useScreen } from '../../Context/ResponsiveContext';
import { useAuth } from '../../Context/AuthContext';
import AuthModal from '../../components/Auth/AuthModal';

interface MovieDetailsType {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  genres: { id: number; name: string }[];
  runtime: number;
  vote_average: number;
}

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isWide, isMobile } = useScreen();
  const [director, setDirector] = useState<string | null>(null);
  const [cast, setCast] = useState<string[]>([]);
  const { isLoggedIn, token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const movieData = await fetchMovieDetails(parseInt(id));
        const videoData = await fetchMovieVideos(parseInt(id));
        const creditsData = await fetchMovieCredits(parseInt(id));
        const director = creditsData.crew.find((person: any) => person.job === 'Director');
        const topCast = creditsData.cast.slice(0, 5).map((actor: any) => actor.name);
        const trailer = videoData.results.find(
          (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
        );
        setMovie(movieData);
        setDirector(director ? director.name : null);
        setCast(topCast);
        setTrailerKey(trailer ? trailer.key : null);

        // ✅ Αυτόματο seed
        fetch(`http://localhost:4000/api/shows/seed/${movieData.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ releaseDate: movieData.release_date })
        });

      } catch (error) {
        console.error('Error loading data', error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!token || !id) { setIsFavorite(false); return; }
    fetch('http://localhost:4000/api/auth/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setIsFavorite((data.favoriteMovieIds || []).includes(Number(id))))
      .catch(() => setIsFavorite(false));
  }, [id, token]);

  const toggleFavorite = async () => {
    if (!movie) return;
    if (!isLoggedIn || !token) { setShowAuth(true); return; }
    const res = await fetch(`http://localhost:4000/api/auth/favorites/${movie.id}`, {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) { setFavoriteMessage(data.error || 'Σφάλμα στα αγαπημένα.'); return; }
    setIsFavorite(data.favoriteMovieIds.includes(movie.id));
    setFavoriteMessage('');
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
  if (!movie) return <div className={styles.message}>Movie not found.</div>;

  return (
    <section className={styles.background}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Πίσω
      </button>
      <div
        className={`${styles.container} ${isWide ? styles.row : styles.column} ${
          isMobile ? styles.alignCenter : styles.alignStart
        }`}
      >
        <div className={styles.leftColumn}>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className={styles.poster}
          />
          <button className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`} onClick={toggleFavorite}>
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Στα αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
          </button>
          {favoriteMessage && <p className={styles.favoriteMessage}>{favoriteMessage}</p>}
          <h2>{movie.title}</h2>
        </div>
        <div className={styles.rightColumn}>
          <h3>Overview</h3>
          <p>{movie.overview}</p>
          <p>
            <strong>Release Date:</strong>{' '}
            {new Date(movie.release_date).toLocaleDateString('en-GB')}
          </p>
          <p>
            <strong>Genres:</strong> {movie.genres.map(g => g.name).join(', ')}
          </p>
          {director && (
            <p>
              <strong>Director:</strong> {director}
            </p>
          )}
          {cast.length > 0 && (
            <p>
              <strong>Actors:</strong> {cast.join(', ')}
            </p>
          )}
          <p className={styles.iconText}>
            <Hourglass
              color="#FFD700"
              size={isMobile ? 16 : 18}
              className={styles.icon}
            />
            <strong>Runtime:</strong> {movie.runtime} minutes
          </p>
          <p className={styles.iconText}>
            <Star
              color="#FFD700"
              size={isMobile ? 16 : 18}
              className={styles.icon}
            />
            <strong>Rating:</strong> {movie.vote_average.toFixed(1)}
          </p>
          {trailerKey && (
            <div className={styles.trailer}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="YouTube trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                width="100%"
                height="100%"
              ></iframe>
            </div>
          )}
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <h3 className={styles.cinemaTitle}>Προβολές</h3>

        <div className={styles.cinemaOption}>
          <div className={styles.cinemaInfo}>
            <span className={styles.cinemaLabel}>Cinema</span>
            <h4 className={styles.cinemaName}>Star Avenue</h4>
            <span className={styles.cinemaLocation}>Los Angeles</span>
          </div>
          <Link
            to={`/book/StarAvenue/${movie.id}`}
            className={styles.redirectButton}
          >
            Αγοράστε Εισιτήριο
          </Link>
        </div>

        <div className={styles.cinemaOption}>
          <div className={styles.cinemaInfo}>
            <span className={styles.cinemaLabel}>Cinema</span>
            <h4 className={styles.cinemaName}>Cinema Blvd</h4>
            <span className={styles.cinemaLocation}>New York</span>
          </div>
          <Link
            to={`/book/CinemaBlvd/${movie.id}`}
            className={styles.redirectButton}
          >
            Αγοράστε Εισιτήριο
          </Link>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </section>
  );
};

export default MovieDetails;
