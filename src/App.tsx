import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useResponsive } from './hooks/useResponsive'; // ✅ correct
import { ResponsiveProvider } from './Context/ResponsiveContext';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Movies from './pages/Movies/Movies';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import Footer from './components/Footer/Footer';
import Starseffect from './components/Stareffect/Starseffect';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import BookingPage from './pages/book/BookingPage';

  const App: React.FC = () => (
   <BrowserRouter>
    <ResponsiveProvider>
    <>
      <Starseffect />
      <ScrollToTop  />
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <div style={{ flex: 1 }}>
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/ShowIventInformation/:cinema/:movieId" element={<BookingPage />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </>
   </ResponsiveProvider>
  </BrowserRouter>
);

export default App;
