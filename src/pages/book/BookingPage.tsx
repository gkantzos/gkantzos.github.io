import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../../api'; // Υποθέτω το έχεις
import { Calendar, Clock, MapPin, Users, Star, ArrowLeft } from 'lucide-react';

interface Show {
  id: string;
  movieId: number;
  date: string;
  time: string;
  hall: string;
  seats: boolean[];
  createdAt: string;
}

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  runtime: number;
  vote_average: number;
  genres: { id: number; name: string }[];
}

interface CinemaInfo {
  id: string;
  name: string;
  location: string;
  seatsPerHall: number;
}

const cinemaData: Record<string, CinemaInfo> = {
  StarAvenue: {
    id: 'StarAvenue',
    name: 'Star Avenue',
    location: 'Los Angeles',
    seatsPerHall: 306
  },
  CinemaBlvd: {
    id: 'CinemaBlvd',
    name: 'Cinema Boulevard',
    location: 'New York',
    seatsPerHall: 274
  }
};

const BookingPage: React.FC = () => {
  const { cinemaName, movieId } = useParams<{ cinemaName: string; movieId: string }>();
  const navigate = useNavigate();

  const [shows, setShows] = useState<Show[]>([]);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cinema, setCinema] = useState<CinemaInfo | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!movieId || !cinemaName) {
      navigate('/');
      return;
    }

    const cinemaInfo = cinemaData[cinemaName];
    if (!cinemaInfo) {
      setError('Μη έγκυρος κινηματογράφος');
      setLoading(false);
      return;
    }
    setCinema(cinemaInfo);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Φόρτωση ταινίας από TMDB
        const movieData = await fetchMovieDetails(parseInt(movieId));
        setMovie(movieData);

        // Φόρτωση προβολών από backend API
        const res = await fetch(`/api/shows?cinema=${cinemaName}&movieId=${movieId}`);
        if (!res.ok) throw new Error('Απέτυχε η φόρτωση των προβολών');
        const data: { shows: Show[] } = await res.json();

        if (!data.shows || data.shows.length === 0) {
          setError('Δεν βρέθηκαν προβολές για αυτή την ταινία σε αυτόν τον κινηματογράφο.');
          setLoading(false);
          return;
        }

        // Ταξινόμηση και αποθήκευση
        data.shows.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        setShows(data.shows);

        // Μοναδικές ημερομηνίες
        const dates = Array.from(new Set(data.shows.map(show => show.date))).sort();
        setAvailableDates(dates);

      } catch (e) {
        console.error(e);
        setError('Σφάλμα κατά τη φόρτωση των δεδομένων. Παρακαλώ δοκιμάστε ξανά.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cinemaName, movieId, navigate]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      const validDate = availableDates.find(date => date >= today) || availableDates[0];
      setSelectedDate(validDate);
    }
  }, [availableDates, selectedDate]);

  useEffect(() => {
    if (selectedDate && shows.length > 0) {
      const filtered = shows.filter(show => show.date === selectedDate);
      setFilteredShows(filtered);
    }
  }, [selectedDate, shows]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateString === todayStr) return 'Σήμερα';
    if (dateString === tomorrowStr) return 'Αύριο';

    return date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getAvailableSeats = (seats: boolean[]) => seats.filter(seat => seat).length;

  const handleShowSelect = (show: Show) => {
    alert(`Επιλέξατε προβολή στις ${show.time} - Αίθουσα ${show.hall}\nΔιαθέσιμες θέσεις: ${getAvailableSeats(show.seats)}`);
  };

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Φόρτωση προβολών...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Σφάλμα</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleBackToMovie}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
          >
            Επιστροφή στην ταινία
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBackToMovie}
            className="mr-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Κράτηση Εισιτηρίων</h1>
            <div className="flex items-center text-gray-300">
              <MapPin size={16} className="mr-2" />
              <span>{cinema?.name} - {cinema?.location}</span>
            </div>
          </div>
        </div>

        {/* Movie Info */}
        {movie && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="w-32 h-48 object-cover rounded-lg mx-auto md:mx-0"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
                <div className="flex items-center gap-4 mb-4 text-gray-300">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{movie.runtime} λεπτά</span>
                  </div>
                  <div className="flex items-center">
                    <Star size={16} className="mr-1 text-yellow-500" />
                    <span>{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="text-gray-300">
                  <strong>Είδη:</strong> {movie.genres.map(g => g.name).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Calendar size={20} className="mr-2" />
            Επιλέξτε Ημερομηνία
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {availableDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedDate === date
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="text-sm font-medium">
                  {formatDate(date)}
                </div>
                <div className="text-xs opacity-75">
                  {new Date(date).toLocaleDateString('el-GR', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Show Times */}
        {selectedDate && filteredShows.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Clock size={20} className="mr-2" />
              Ώρες προβολής για {formatDate(selectedDate)}
            </h3>
            <div className="grid gap-4">
              {filteredShows.map(show => (
                <div
                  key={show.id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {show.time}
                        </div>
                        <div className="text-sm text-gray-400">
                          Ώρα έναρξης
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          Αίθουσα {show.hall}
                        </div>
                        <div className="text-sm text-gray-400">
                          <Users size={14} className="inline mr-1" />
                          {getAvailableSeats(show.seats)} διαθέσιμες θέσεις
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleShowSelect(show)}
                      disabled={getAvailableSeats(show.seats) === 0}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        getAvailableSeats(show.seats) === 0
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {getAvailableSeats(show.seats) === 0 ? 'Εξαντλημένο' : 'Επιλογή θέσεων'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedDate && filteredShows.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>Δεν υπάρχουν διαθέσιμες προβολές για την επιλεγμένη ημερομηνία.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
