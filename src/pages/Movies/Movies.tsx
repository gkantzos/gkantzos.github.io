import React, { useEffect, useState } from 'react';
import { fetchPopularMovies } from '../../api';
import Cards from '../../components/Cards/Cards';
import styles from './Movies.module.css';
import { useScreen } from '../../Context/ResponsiveContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import AuthModal from '../../components/Auth/AuthModal';

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
  useScreen();
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [favoriteMovieIds, setFavoriteMovieIds] = useState<number[]>([]);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [showAuth, setShowAuth] = useState(false);

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

  useEffect(() => {
    if (!token) { setFavoriteMovieIds([]); return; }
    fetch('http://localhost:4000/api/auth/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setFavoriteMovieIds(data.favoriteMovieIds || []))
      .catch(() => setFavoriteMovieIds([]));
  }, [token]);

  const handleCardClick = (id: number) => {
    navigate(`/movie/${id}`);
  };

  const toggleFavorite = async (id: number) => {
    if (!isLoggedIn || !token) { setShowAuth(true); return; }
    const isFavorite = favoriteMovieIds.includes(id);
    const res = await fetch(`http://localhost:4000/api/auth/favorites/${id}`, {
      method: isFavorite ? 'DELETE' : 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) { setFavoriteMessage(data.error || 'Σφάλμα στα αγαπημένα.'); return; }
    setFavoriteMovieIds(data.favoriteMovieIds);
    setFavoriteMessage('');
  };

  const genres = Array.from(new Set(movies.flatMap(movie => movie.genre_names))).sort();
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase()) &&
    (selectedGenre === 'all' || movie.genre_names.includes(selectedGenre))
  );

  return (
    <section className={styles.background}>
      <div className={styles.containerWide}>
        <div className={styles.header}>
          <h1 className={styles.title}>Popular movies</h1>
          <p className={styles.subtitle}>Browse through the trending titles currently playing in cinemas.</p>
        </div>

        <div className={styles.filters}>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Αναζήτηση ταινίας..." />
          <select value={selectedGenre} onChange={event => setSelectedGenre(event.target.value)}><option value="all">Όλα τα είδη</option>{genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}</select>
        </div>
        {favoriteMessage && <p className={styles.favoriteMessage}>{favoriteMessage}</p>}

        <div>
          {filteredMovies.length > 0 ? (
            <Cards movies={filteredMovies} onCardClick={handleCardClick} favoriteMovieIds={favoriteMovieIds} onToggleFavorite={toggleFavorite} />
          ) : (
            <div className={styles.noMovies}>Δεν βρέθηκαν ταινίες</div>
          )}
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    </section>
  );
};

export default Movies;
