import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ResponsiveProvider } from './Context/ResponsiveContext';
import { AuthProvider } from './Context/AuthContext';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Movies from './pages/Movies/Movies';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import Footer from './components/Footer/Footer';
import Starseffect from './components/Stareffect/Starseffect';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import BookingPage from './pages/book/BookingPage';
import LoginButton from './components/LoginButton/LoginButton';
import Achievements from './pages/Achievements/Achievements';
import MyBookings from './pages/MyBookings/MyBookings';
import Favorites from './pages/Favorites/Favorites';

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ResponsiveProvider>
        <>
          <Starseffect />
          <ScrollToTop />
          <LoginButton />
          <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <Sidebar />
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/book/:cinemaName/:movieId" element={<BookingPage />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/favorites" element={<Favorites />} />
                </Routes>
              </div>
            </div>
            <Footer />
          </div>
        </>
      </ResponsiveProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
