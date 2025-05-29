import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ReactComponent as HomeIcon } from '../../assets/house-solid.svg';
import { ReactComponent as MovieIcon } from '../../assets/video-camera-svgrepo-com.svg';
import styles from './Sidebar.module.css';
import LogoImage from '../../assets/moviesite logo.png';
import { useIsWide } from '../../Context/AspectRationContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isWide = useIsWide();

  return (
    <nav className={styles.sidebar}>
      <Link to="/" className={styles.logo}>
        <img src={LogoImage} alt="MovieSite Logo" className={styles.logoImage} />
        {isWide && <span className={styles.logoSubtitle}>cinemas</span>}
      </Link>

      <ul className={styles.navList}>
        <li className={location.pathname === '/' ? styles.active : ''}>
          <Link to="/" className={styles.navLink}>
            <HomeIcon className={styles.icon} />
            {isWide && <span className={styles.label}>Home</span>}
          </Link>
        </li>
        <li className={location.pathname.startsWith('/movies') ? styles.active : ''}>
          <Link to="/movies" className={styles.navLink}>
            <MovieIcon className={styles.icon} />
            {isWide && <span className={styles.label}>Movies</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
