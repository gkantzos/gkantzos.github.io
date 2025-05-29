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
  
  // Προσαρμόζουμε τον αριθμό των αστεριών ανάλογα με το μέγεθος της οθόνης
  const getStarsCount = () => {
    if (isMobile) return Math.floor(width / 12); // ~50-65 stars
    if (isTablet) return Math.floor(width / 10); // ~75-100 stars
    if (isDesktop) return Math.floor(width / 8); // ~125-160 stars
    if (isUltrawide) return Math.floor(width / 12); // ~160-200 stars
    return 80; // fallback
  };

  // Προσαρμόζουμε το μέγεθος των αστεριών
  const getStarSizeRange = () => {
    if (isMobile) return { min: 0.8, max: 1.5 };
    if (isTablet) return { min: 1, max: 2 };
    if (isDesktop) return { min: 1.2, max: 2.5 };
    if (isUltrawide) return { min: 1.5, max: 3 };
    return { min: 1, max: 2 };
  };

  // Προσαρμόζουμε την opacity
  const getOpacityRange = () => {
    if (isMobile) return { min: 0.4, max: 0.7 };
    if (isTablet) return { min: 0.5, max: 0.8 };
    if (isDesktop) return { min: 0.6, max: 0.9 };
    if (isUltrawide) return { min: 0.7, max: 1 };
    return { min: 0.5, max: 0.8 };
  };

  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starsCount = getStarsCount();
    const sizeRange = getStarSizeRange();
    const opacityRange = getOpacityRange();
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