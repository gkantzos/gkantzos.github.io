import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ReactComponent as HomeIcon } from '../../assets/house-solid.svg';
import { ReactComponent as MovieIcon } from '../../assets/video-camera-svgrepo-com.svg';
import styles from './Sidebar.module.css';
import LogoImage from '../../assets/moviesite logo.png';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={styles.sidebar}>
      <Link to="/" className={styles.logo}>
  <img src={LogoImage} alt="MovieSite Logo" className={styles.logoImage} />
  <span className={styles.logoSubtitle}>cinemas</span>
</Link>
      {/* <Link to="/" className={styles.logo}>
        MovieSite
      </Link> */}
      <ul className={styles.navList}>
        <li className={location.pathname === '/' ? styles.active : ''}>
          <Link to="/" className={styles.navLink}>
            <HomeIcon className={styles.icon} />
            Home
          </Link>
        </li>
        <li className={location.pathname.startsWith('/movies') ? styles.active : ''}>
          <Link to="/movies" className={styles.navLink}>
            <MovieIcon className={styles.icon} />
            Movies
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
