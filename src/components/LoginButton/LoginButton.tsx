import React, { useState } from 'react';
import styles from './LoginButton.module.css';
import { useAuth } from '../../Context/AuthContext';
import AuthModal from '../Auth/AuthModal';

const LoginButton: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <div className={styles.wrapper}>
        {isLoggedIn ? (
          <>
            <span className={styles.userEmail}>{user?.email}</span>
            <button className={styles.logoutButton} onClick={logout}>
              Αποσύνδεση
            </button>
          </>
        ) : (
          <button className={styles.loginButton} onClick={() => setShowAuth(true)}>
            Σύνδεση / Εγγραφή
          </button>
        )}
      </div>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </>
  );
};

export default LoginButton;