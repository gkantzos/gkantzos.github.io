import React, { useCallback, useEffect, useState } from 'react';
import { Award, Clapperboard, Crown, Film, Gift, Lock, Medal, Popcorn, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import styles from './Achievements.module.css';

interface ClaimedReward {
  rewardId: string;
  code: string;
  claimedAt: string;
  name?: string;
  usedAt?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  ticketsRequired: number;
  pointsRequired: number;
  icon: string;
  unlocked: boolean;
  reward: { name: string } | null;
}

interface Profile {
  points: number;
  ticketsBooked: number;
  achievements: Achievement[];
  claimedRewards: ClaimedReward[];
}

const icons: Record<string, React.ReactNode> = {
  Ticket: <Ticket />, Film: <Film />, Popcorn: <Popcorn />, Star: <Star />,
  Award: <Award />, Clapperboard: <Clapperboard />, Trophy: <Trophy />,
  Medal: <Medal />, Crown: <Crown />, Sparkles: <Sparkles />
};

const Achievements: React.FC = () => {
  const { isLoggedIn, token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'achievements' | 'rewards'>('achievements');

  const loadProfile = useCallback(async () => {
    if (!token) return;
    const res = await fetch('http://localhost:4000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProfile(data);
  }, [token]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    loadProfile().catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [isLoggedIn, loadProfile]);

  const claimReward = async (achievementId: string) => {
    if (!token) return;
    setError('');
    try {
      const res = await fetch(`http://localhost:4000/api/auth/rewards/${achievementId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isLoggedIn) return (
    <section className={styles.page}>
      <div className={styles.empty}><Lock size={42} /><h1>Τα Achievements σας</h1><p>Συνδεθείτε για να κερδίζετε πόντους, rewards και badges.</p></div>
    </section>
  );

  if (loading) return <section className={styles.page}><div className={styles.empty}>Φόρτωση achievements...</div></section>;
  if (error && !profile) return <section className={styles.page}><div className={styles.empty}>{error}</div></section>;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>MOVIETIME CLUB</p><h1>Achievements</h1><p>Κλείσε εισιτήρια, κέρδισε πόντους και ξεκλείδωσε δώρα.</p></div>
        <div className={styles.stats}><div><strong>{profile?.points ?? 0}</strong><span>πόντοι</span></div><div><strong>{profile?.ticketsBooked ?? 0}</strong><span>εισιτήρια</span></div></div>
      </header>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.tabs}>
        <button className={activeTab === 'achievements' ? styles.activeTab : ''} onClick={() => setActiveTab('achievements')}>Achievements</button>
        <button className={activeTab === 'rewards' ? styles.activeTab : ''} onClick={() => setActiveTab('rewards')}>My Rewards</button>
      </div>
      {activeTab === 'achievements' ? <div className={styles.grid}>
        {profile?.achievements.map(achievement => {
          const claimed = profile.claimedRewards.find(reward => reward.rewardId === achievement.id);
          const progress = Math.min(100, ((profile.points || 0) / achievement.pointsRequired) * 100);
          const pointsProgress = Math.min(profile.points || 0, achievement.pointsRequired);
          return <article key={achievement.id} className={`${styles.card} ${achievement.unlocked ? styles.unlocked : styles.locked}`}>
            <div className={styles.icon}>{icons[achievement.icon] || <Lock />}</div>
            <div className={styles.content}><h2>{achievement.name}</h2><p>{achievement.description}</p><small>{achievement.unlocked ? 'Ξεκλειδώθηκε' : 'Κλειδωμένο'}</small>
              <div className={styles.progressLabel}><span>Πρόοδος</span><span>{pointsProgress} / {achievement.pointsRequired} πόντοι</span></div>
              <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
              {achievement.reward && (claimed ? <div className={styles.code}><Gift size={15} /> Κωδικός: {claimed.code}</div> : achievement.unlocked ? <button onClick={() => claimReward(achievement.id)}>Πάρε το {achievement.reward.name}</button> : <div className={styles.reward}><Gift size={15} /> Reward: {achievement.reward.name}</div>)}</div>
          </article>;
        })}
      </div> : <div className={styles.rewardsGrid}>
        {profile?.claimedRewards.map(reward => <article key={reward.rewardId} className={`${styles.rewardCard} ${reward.usedAt ? styles.rewardUsed : ''}`}>
          <div className={styles.icon}><Gift /></div>
          <div className={styles.content}><h2>{reward.name || 'MovieTime Reward'}</h2><p>{reward.usedAt ? 'Έχει ήδη χρησιμοποιηθεί σε κράτηση.' : 'Διαθέσιμο για εξαργύρωση στο Booking.'}</p>
            <div className={styles.code}><Gift size={15} /> Κωδικός: {reward.code}</div>
          </div>
        </article>)}
        {profile?.achievements.filter(achievement => achievement.reward && achievement.unlocked && !profile.claimedRewards.some(reward => reward.rewardId === achievement.id)).map(achievement => <article key={achievement.id} className={styles.rewardCard}>
          <div className={styles.icon}>{icons[achievement.icon] || <Gift />}</div>
          <div className={styles.content}><h2>{achievement.reward?.name}</h2><p>Από το achievement: {achievement.name}</p><button onClick={() => claimReward(achievement.id)}>Απόκτηση Reward</button></div>
        </article>)}
        {profile && profile.claimedRewards.length === 0 && !profile.achievements.some(achievement => achievement.reward && achievement.unlocked) && <div className={styles.noRewards}>Δεν έχεις ξεκλειδώσει ακόμη rewards. Συνέχισε με κρατήσεις για να κερδίσεις!</div>}
      </div>}
    </section>
  );
};

export default Achievements;
