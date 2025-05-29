import React, { useEffect, useState } from 'react';
import styles from './Starseffect.module.css';
import { useIsWide } from '../../Context/AspectRationContext';
interface Star {
  id: number;
  top: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
}

const Starseffect: React.FC = () => {
  const isWide = useIsWide();
  const starsCount = isWide ? 150 : 80;  // λιγότερα αστέρια σε στενές οθόνες

  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars: Star[] = [];
    for (let i = 0; i < starsCount; i++) {
      generatedStars.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        animationDelay: Math.random() * 2,
        animationDuration: 1.5 + Math.random() * 1.5,
      });
    }
    setStars(generatedStars);
  }, [starsCount]);  // προσθέτουμε το starsCount στα dependencies για επανεκτέλεση αν αλλάξει

  return (
    <div className={styles.container}>
      {stars.map(star => (
        <div
          key={star.id}
          className={styles.star}
          style={{
            top: `${star.top}vh`,
            left: `${star.left}vw`,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Starseffect;
