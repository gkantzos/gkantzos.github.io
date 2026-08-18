// hooks/useResponsive.ts
import { useState, useEffect } from 'react';

export interface ScreenSize {
  width: number;
  height: number;
  isMobile: false;
  isTablet: false;
  isDesktop: boolean;
  isUltrawide: boolean;
}

const ULTRAWIDE_BREAKPOINT = 2560;

const getScreenSize = (): ScreenSize => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    width,
    height,
    isMobile: false,
    isTablet: false,
    isDesktop: width < ULTRAWIDE_BREAKPOINT,
    isUltrawide: width >= ULTRAWIDE_BREAKPOINT,
  };
};

export function useResponsive(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize);

  useEffect(() => {
    function handleResize() {
      setScreenSize(getScreenSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
