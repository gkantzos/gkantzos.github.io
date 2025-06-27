import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchMovieVideos, fetchMovieCredits} from '../../api';
import styles from './MovieDetails.module.css';
import { Star, Hourglass } from 'lucide-react';
import { useScreen } from '../../Context/ResponsiveContext';

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
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isWide, isMobile } = useScreen();
  const [director, setDirector] = useState<string | null>(null);
  const [cast, setCast] = useState<string[]>([]);


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
      } catch (error) {
        console.error('Error loading data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className={styles.message}>Loading...</div>;
  if (!movie) return <div className={styles.message}>Movie not found.</div>;

  return (
    <section className={styles.background}>
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
         <strong>Αctors:</strong> {cast.join(', ')}
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
            <strong>Rating:</strong> {movie.vote_average.toFixed(2)}/10
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
    <a
      href={`/book/StarAvenue/${movie.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.redirectButton}
    >
      Αγοράστε Εισιτήριο
    </a>
  </div>

  <div className={styles.cinemaOption}>
    <div className={styles.cinemaInfo}>
      <span className={styles.cinemaLabel}>Cinema</span>
      <h4 className={styles.cinemaName}>Cinema Blvd</h4>
      <span className={styles.cinemaLocation}>New York</span>
    </div>
    <a
      href={`/book/CinemaBlvd/${movie.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.redirectButton}
    >
      Αγοράστε Εισιτήριο
    </a>
  </div>
</div>
    </section>
  );
};

export default MovieDetails;
