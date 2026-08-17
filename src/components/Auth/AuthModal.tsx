import React, { useState } from 'react';
import styles from './AuthModal.module.css';
import { useAuth } from '../../Context/AuthContext';

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

interface AuthModalProps {
  onClose: () => void;
  onGuest?: () => void;
  onAuthenticated?: (token: string) => void;
  showGuest?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onGuest, onAuthenticated, showGuest }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.email, data.token);
      onAuthenticated?.(data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Στάλθηκε κωδικός επαλήθευσης στο email σας!');
      setMode('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.email, data.token);
      onAuthenticated?.(data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setMode('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setCode('');
      setPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalWrapper}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>✕</button>

          {mode === 'verify' ? (
            <>
              <div className={styles.title}>Επαλήθευση</div>
              <div className={styles.subtitle}>
                Εισάγετε τον 6ψήφιο κωδικό που στάλθηκε στο {email}
              </div>
              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Κωδικός επαλήθευσης"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <button
                className={styles.submitButton}
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Επαλήθευση...' : 'Επαλήθευση'}
              </button>
            </>
          ) : mode === 'forgot' ? (
            <>
              <div className={styles.title}>Επαναφορά κωδικού</div>
              <div className={styles.subtitle}>Θα στείλουμε έναν 6ψήφιο κωδικό στο email σας.</div>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.inputGroup}>
                <input className={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button className={styles.submitButton} onClick={handleForgotPassword} disabled={loading || !email}>
                {loading ? '...' : 'Αποστολή κωδικού'}
              </button>
              <button className={styles.guestButton} onClick={() => { setMode('login'); setError(''); }}>
                Πίσω στη σύνδεση
              </button>
            </>
          ) : mode === 'reset' ? (
            <>
              <div className={styles.title}>Νέος κωδικός</div>
              <div className={styles.subtitle}>Εισαγάγετε τον κωδικό που στάλθηκε στο {email}.</div>
              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}
              <div className={styles.inputGroup}>
                <input className={styles.input} type="text" placeholder="Κωδικός επαναφοράς" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
                <input className={styles.input} type="password" placeholder="Νέος κωδικός" value={password} onChange={e => setPassword(e.target.value)} />
                <input className={styles.input} type="password" placeholder="Επιβεβαίωση νέου κωδικού" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <button className={styles.submitButton} onClick={handleResetPassword} disabled={loading || code.length !== 6 || !password || password !== confirmPassword}>
                {loading ? '...' : 'Αλλαγή κωδικού'}
              </button>
            </>
          ) : (
            <>
              <div className={styles.title}>MovieTime</div>
              <div className={styles.subtitle}>Συνδεθείτε για να κάνετε κράτηση</div>

              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
                  onClick={() => { setMode('login'); setError(''); setConfirmPassword(''); }}
                >
                  Σύνδεση
                </button>
                <button
                  className={`${styles.tab} ${mode === 'register' ? styles.active : ''}`}
                  onClick={() => { setMode('register'); setError(''); }}
                >
                  Εγγραφή
                </button>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Κωδικός"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                {mode === 'register' && (
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="Επιβεβαίωση κωδικού"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                )}
              </div>

              <button
                className={styles.submitButton}
                onClick={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading || !email || !password || (mode === 'register' && password !== confirmPassword)}
              >
                {loading ? '...' : mode === 'login' ? 'Σύνδεση' : 'Εγγραφή'}
              </button>

              {mode === 'login' && (
                <button className={styles.forgotButton} onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
                  Ξεχάσατε τον κωδικό σας;
                </button>
              )}

              {showGuest && (
                <>
                  <div className={styles.divider}>ή</div>
                  <button className={styles.guestButton} onClick={onGuest}>
                    Συνέχεια ως επισκέπτης
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
