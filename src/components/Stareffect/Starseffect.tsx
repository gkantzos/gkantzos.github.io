import React, { useEffect, useState } from 'react';
import styles from './Starseffect.module.css';

interface Star {
  id: number;
  top: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
}

const Starseffect: React.FC = () => {
  const starsCount = 150;

  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars: Star[] = [];
    for (let i = 0; i < starsCount; i++) {
      generatedStars.push({
        id: i,
        top: Math.random() * 100, // σε ποσοστό vh
        left: Math.random() * 100, // σε ποσοστό vw
        animationDelay: Math.random() * 2, // σε sec
        animationDuration: 1.5 + Math.random() * 1.5, // 1.5 - 3 sec
      });
    }
    setStars(generatedStars);
  }, []);

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
