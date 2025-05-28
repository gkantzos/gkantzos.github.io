import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails } from '../../api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchMovieDetails(parseInt(id))
      .then(data => {
        setMovie(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading movie details', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div style={{ display: 'flex', padding: 20, gap: 20 }}>
      <div style={{ flex: '0 0 300px' }}>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          style={{ width: '100%', borderRadius: 8 }}
        />
        <h2>{movie.title}</h2>
      </div>
      <div style={{ flex: 1 }}>
        <h3>Overview</h3>
        <p>{movie.overview}</p>
        <p><strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString('en-GB')}</p>
        <p><strong>Genres:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
        <p><strong>Rating:</strong> {movie.vote_average}/10</p>
      </div>
    </div>
  );
};

export default MovieDetails;
