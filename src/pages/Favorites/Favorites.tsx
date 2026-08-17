import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../../api';
import { useAuth } from '../../Context/AuthContext';
import Cards from '../../components/Cards/Cards';
import styles from './Favorites.module.css';

const Favorites: React.FC = () => {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('http://localhost:4000/api/auth/favorites', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(async data => {
        const favoriteIds = data.favoriteMovieIds || [];
        setIds(favoriteIds);
        const results = await Promise.all(favoriteIds.map((id: number) => fetchMovieDetails(id)));
        setMovies(results.map(movie => ({ ...movie, genre_names: movie.genres?.map((genre: any) => genre.name) || [] })));
      })
      .finally(() => setLoading(false));
  }, [token]);

  const toggleFavorite = async (id: number) => {
    if (!token) return;
    const res = await fetch(`http://localhost:4000/api/auth/favorites/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setIds(data.favoriteMovieIds); setMovies(current => current.filter(movie => movie.id !== id)); }
  };

  if (!isLoggedIn) return <section className={styles.page}><div className={styles.empty}><Heart size={42} /><h1>Αγαπημένες ταινίες</h1><p>Συνδεθείτε για να αποθηκεύετε τις αγαπημένες σας ταινίες.</p></div></section>;
  if (loading) return <section className={styles.page}><div className={styles.empty}>Φόρτωση αγαπημένων...</div></section>;
  return <section className={styles.page}><header><Heart fill="currentColor" /><div><p>MY MOVIETIME</p><h1>Αγαπημένες ταινίες</h1></div></header>{movies.length ? <Cards movies={movies} onCardClick={id => navigate(`/movie/${id}`)} favoriteMovieIds={ids} onToggleFavorite={toggleFavorite} /> : <div className={styles.empty}><Heart size={42} /><p>Δεν έχετε προσθέσει ακόμη αγαπημένες ταινίες.</p></div>}</section>;
};

export default Favorites;
