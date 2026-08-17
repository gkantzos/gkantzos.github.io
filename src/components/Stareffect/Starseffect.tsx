import React, { useEffect, useState } from 'react';
import styles from './Starseffect.module.css';
import { useScreen } from '../../Context/ResponsiveContext';

interface Star {
  id: number;
  top: number;
  left: number;
  animationDelay: number;
  animationDuration: number;
  size: number;
  opacity: number;
}

const Starseffect: React.FC = () => {
  const { isMobile, isTablet, isDesktop, isUltrawide, width } = useScreen();
  
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starsCount = isMobile ? Math.floor(width / 12) : isTablet ? Math.floor(width / 10) : isDesktop ? Math.floor(width / 8) : isUltrawide ? Math.floor(width / 12) : 80;
    const sizeRange = isMobile ? { min: 0.8, max: 1.5 } : isTablet ? { min: 1, max: 2 } : isDesktop ? { min: 1.2, max: 2.5 } : isUltrawide ? { min: 1.5, max: 3 } : { min: 1, max: 2 };
    const opacityRange = isMobile ? { min: 0.4, max: 0.7 } : isTablet ? { min: 0.5, max: 0.8 } : isDesktop ? { min: 0.6, max: 0.9 } : isUltrawide ? { min: 0.7, max: 1 } : { min: 0.5, max: 0.8 };
    const generatedStars: Star[] = [];
    
    for (let i = 0; i < starsCount; i++) {
      generatedStars.push({
        id: i,
        // Πιο ομοιόμορφη κατανομή αστεριών
        top: Math.random() * 95 + 2.5, // Avoid edges
        left: Math.random() * 95 + 2.5, // Avoid edges
        animationDelay: Math.random() * 4,
        animationDuration: 1.2 + Math.random() * 2.8, // Πιο ποικίλα intervals
        size: sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min),
        opacity: opacityRange.min + Math.random() * (opacityRange.max - opacityRange.min)
      });
    }
    setStars(generatedStars);
  }, [isMobile, isTablet, isDesktop, isUltrawide, width]);

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
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity
          }}
        />
      ))}
    </div>
  );
};

export default Starseffect;
