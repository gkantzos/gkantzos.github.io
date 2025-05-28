import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer: React.FC = () => (
  <footer className={styles.footer}>
    <div className={styles.locations}>
      <h2>Our Locations</h2>
      <p>📍 1234 Star Avenue, Los Angeles, CA 90001</p>
      <p>📍 5678 Cinema Blvd, New York, NY 10001</p>
    </div>

    <div className={styles.contact}>
      <h2>Contact Us</h2>
      <p><FaPhoneAlt /> +1 (555) 123-4567</p>
      <p><FaEnvelope /> contact@movietime.com</p>
    </div>

    <div className={styles.socials}>
      
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
    </div>

    <p className={styles.copy}>© {new Date().getFullYear()} MovieTime Cinemas. All rights reserved.</p>
  </footer>
);

export default Footer;
