import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchMovieVideos } from '../../api';
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

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const movieData = await fetchMovieDetails(parseInt(id));
        const videoData = await fetchMovieVideos(parseInt(id));
        const trailer = videoData.results.find(
          (vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube'
        );

        setMovie(movieData);
        setTrailerKey(trailer ? trailer.key : null);
      } catch (error) {
        console.error('Error loading data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>Loading...</div>;
  if (!movie) return <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>Movie not found.</div>;

  return (
    <section className="background">
      <div
        className={styles.container}
        style={{ 
          flexDirection: isWide ? 'row' : 'column',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}
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
          <p>
            <strong>
              <Hourglass
                color="#FFD700"
                size={isMobile ? 16 : 18}
                style={{ marginRight: 5 }}
              />{' '}
              Runtime:
            </strong>{' '}
            {movie.runtime} minutes
          </p>
          <p>
            <strong>
              <Star 
                color="#FFD700" 
                size={isMobile ? 16 : 18} 
                style={{ marginRight: 5 }} 
              />{' '}
              Rating:
            </strong>{' '}
            {movie.vote_average.toFixed(2)}/10
          </p>

          {trailerKey && (
            <div className={styles.trailer}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="YouTube trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MovieDetails;