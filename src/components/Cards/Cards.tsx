import React, { useEffect, useState } from 'react';
import styles from './Cards.module.css';
import { fetchMovieVideos } from '../../api';
import { useScreen } from '../../Context/ResponsiveContext';
import { Heart } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  genre_names: string[];
}

interface CardsProps {
  movies: Movie[];
  onCardClick: (id: number) => void;
  favoriteMovieIds?: number[];
  onToggleFavorite?: (id: number) => void;
}

const truncate = (text: string, maxWords: number) => {
  if (!text) return '';
  const words = text.split(' ');
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ') + '...';
};

const Cards: React.FC<CardsProps> = ({ movies, onCardClick, favoriteMovieIds = [], onToggleFavorite }) => {
  const [trailers, setTrailers] = useState<{ [key: number]: string }>({});
  const [flippedCardId, setFlippedCardId] = useState<number | null>(null);

  const { isUltrawide } = useScreen();

  // Καθορίζουμε το grid class με βάση το screen size
  const getGridClass = () => {
    if (isUltrawide) return styles.gridUltrawide;
    return styles.gridDesktop;
  };

  // Καθορίζουμε πόσες λέξεις να δείχνουμε στην περιγραφή
  const getMaxWords = () => {
    return 15;
  };

  useEffect(() => {
    async function loadTrailers() {
      const trailerMap: { [key: number]: string } = {};
      await Promise.all(
        movies.map(async (movie) => {
          try {
            const data = await fetchMovieVideos(movie.id);
            let trailer = data.results.find(
  (video: any) =>
    video.type === 'Trailer' && video.site === 'YouTube' && video.official
);

if (!trailer) {
  trailer = data.results.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );
}
            if (trailer) {
              trailerMap[movie.id] = trailer.key;
            }
          } catch (error) {
            console.error('Failed to fetch trailer for movie id:', movie.id);
          }
        })
      );
      setTrailers(trailerMap);
    }
    loadTrailers();
  }, [movies]);

  if (movies.length === 0) return <p>No movies available</p>;

  return (
    <div className={getGridClass()}>
      {movies.map(movie => {
        const isFlipped = flippedCardId === movie.id;

        return (
          <div
            key={movie.id}
            className={styles.cardWrapper}
            onClick={() => onCardClick(movie.id)}
            onMouseEnter={() => setFlippedCardId(movie.id)}
            onMouseLeave={() => setFlippedCardId(null)}
          >
            <div className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}>
              <div className={styles.cardImage}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                />
              </div>

              <div className={styles.cardContent}>
                {onToggleFavorite && (
                  <button
                    className={`${styles.favoriteButton} ${favoriteMovieIds.includes(movie.id) ? styles.favoriteActive : ''}`}
                    onClick={event => { event.stopPropagation(); onToggleFavorite(movie.id); }}
                    aria-label="Προσθήκη στα αγαπημένα"
                    title={favoriteMovieIds.includes(movie.id) ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
                  >
                    <Heart size={19} fill={favoriteMovieIds.includes(movie.id) ? 'currentColor' : 'none'} />
                  </button>
                )}
                <p><strong>Description:</strong></p>
                <p>{truncate(movie.overview, getMaxWords())}</p>
                <h3>
                  <span className={styles.label}>Genres:</span>{' '}
                  {Array.isArray(movie.genre_names) && movie.genre_names.length > 0
                    ? movie.genre_names.join(', ')
                    : 'Unknown'}
                </h3>
                <h3>
                  <span className={styles.label}>Release Date:</span>{' '}
                  {new Date(movie.release_date).toLocaleDateString('en-GB')}
                </h3>

                {trailers[movie.id] ? (
                  <div className={styles.trailerContainer}>
                    {isFlipped && (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${trailers[movie.id]}?rel=0&autoplay=1&mute=1&controls=1`}
                        title={`${movie.title} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                ) : (
                  <p>No trailer available</p>
                )}
              </div>
            </div>
            <div className={styles.titleUnder}>{movie.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Cards;
