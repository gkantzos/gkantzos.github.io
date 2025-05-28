import React, { useEffect, useState } from 'react';
import { fetchPopularMovies } from '../../api';
import Cards from '../Cards/Cards';
import styles from './Movies.module.css';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  genre_names: string[];
}

const genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetchPopularMovies()
      .then((data: any) => {
        if (!data.results || data.results.length === 0) {
          setMovies([]);
          return;
        }
        const adaptedMovies = data.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview,
          release_date: movie.release_date,
          genre_names: movie.genre_ids ? movie.genre_ids.map((id: number) => genreMap[id] || 'Unknown') : [],
        }));
        setMovies(adaptedMovies);
      })
      .catch(() => {
        setMovies([]);
      });
  }, []);

  const handleCardClick = (id: number) => {
    window.location.href = `/movie/${id}`;
  };

  return (
    <section className={styles.background}>
      <div className={styles.header}>
        <h1 className={styles.title}>Popular movies</h1>
        <p className={styles.subtitle}>Browse through the trending titles currently playing in cinemas.</p>
      </div>

      <div>
        {movies.length > 0 ? (
          <Cards movies={movies} onCardClick={handleCardClick} />
        ) : (
          <div className={styles.noMovies}>No movies available</div>
        )}
      </div>
    </section>
  );
};

export default Movies;
