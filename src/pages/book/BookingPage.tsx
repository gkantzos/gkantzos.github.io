import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Showtime {
  id: number;
  movie_id: number;
  showtime: string;
  room: string; // Αν προσθέσεις room στην DB
}

interface ShowtimesResponse {
  movieId: number;
  cinema: string;
  showtimes: Showtime[];
}

const BookingPage: React.FC = () => {
  const { cinemaName, movieId } = useParams<{ cinemaName: string; movieId: string }>();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredTimes, setFilteredTimes] = useState<Showtime[]>([]);

useEffect(() => {
  const fetchShowtimes = async () => {
    if (!movieId || !cinemaName) return;

    try {
      const response = await axios.get<ShowtimesResponse>(`/api/showtimes/${movieId}?cinema=${cinemaName}`);
      const data = response.data.showtimes;
      setShowtimes(data);

      const dates = Array.from(
        new Set(data.map(s => new Date(s.showtime).toISOString().split('T')[0]))
      );
      setAvailableDates(dates);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  };

  fetchShowtimes();
}, [movieId, cinemaName]);

  // Αυτόματα επιλέγουμε πρώτη ημερομηνία αν υπάρχει και δεν έχει επιλεχθεί ακόμα
  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = showtimes.filter(s => s.showtime.startsWith(selectedDate));
      setFilteredTimes(filtered);
    }
  }, [selectedDate, showtimes]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Επιλέξτε Ημερομηνία</h1>
      <select
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="">-- Επιλέξτε Ημερομηνία --</option>
        {availableDates.map(date => (
          <option key={date} value={date}>
            {new Date(date).toLocaleDateString('el-GR')}
          </option>
        ))}
      </select>

      {selectedDate && (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Ώρες προβολής για {new Date(selectedDate).toLocaleDateString('el-GR')}
          </h2>
          <ul className="space-y-2">
            {filteredTimes.map(s => (
              <li key={s.id} className="border p-2 rounded">
                <strong>
                  {new Date(s.showtime).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                </strong>
                {s.room && <span className="ml-2">| Αίθουσα: {s.room}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
