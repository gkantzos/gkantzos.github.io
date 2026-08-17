import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ReactComponent as HomeIcon } from '../../assets/house-solid.svg';
import { ReactComponent as MovieIcon } from '../../assets/video-camera-svgrepo-com.svg';
import styles from './Sidebar.module.css';
import LogoImage from '../../assets/moviesite logo.png';
import { useScreen } from '../../Context/ResponsiveContext';
import { Award, Heart, Ticket } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isWide, isMobile, isTablet } = useScreen();

  // Καθορίζουμε αν θα δείχνουμε labels και subtitle
  const showLabels = isWide && !isTablet;
  const showSubtitle = isWide && !isMobile && !isTablet;

  return (
    <nav className={styles.sidebar}>
      <Link to="/" className={styles.logo}>
        <img 
          src={LogoImage} 
          alt="MovieSite Logo" 
          className={styles.logoImage} 
        />
        {showSubtitle && (
          <span className={styles.logoSubtitle}>cinemas</span>
        )}
      </Link>

      <ul className={styles.navList}>
        <li className={location.pathname === '/' ? styles.active : ''}>
          <Link 
            to="/" 
            className={styles.navLink}
            title={!showLabels ? 'Home' : undefined}
          >
            <HomeIcon className={styles.icon} />
            {showLabels && <span className={styles.label}>Home</span>}
          </Link>
        </li>
        <li className={location.pathname.startsWith('/movies') ? styles.active : ''}>
          <Link 
            to="/movies" 
            className={styles.navLink}
            title={!showLabels ? 'Movies' : undefined}
          >
            <MovieIcon className={styles.icon} />
            {showLabels && <span className={styles.label}>Movies</span>}
          </Link>
        </li>
        <li className={location.pathname.startsWith('/achievements') ? styles.active : ''}>
          <Link
            to="/achievements"
            className={styles.navLink}
            title={!showLabels ? 'Achievements' : undefined}
          >
            <Award className={styles.icon} />
            {showLabels && <span className={styles.label}>Achievements</span>}
          </Link>
        </li>
        <li className={location.pathname.startsWith('/my-bookings') ? styles.active : ''}>
          <Link to="/my-bookings" className={styles.navLink} title={!showLabels ? 'My Bookings' : undefined}>
            <Ticket className={styles.icon} />
            {showLabels && <span className={styles.label}>My Bookings</span>}
          </Link>
        </li>
        <li className={location.pathname.startsWith('/favorites') ? styles.active : ''}>
          <Link to="/favorites" className={styles.navLink} title={!showLabels ? 'Favorites' : undefined}>
            <Heart className={styles.icon} />
            {showLabels && <span className={styles.label}>Favorites</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
