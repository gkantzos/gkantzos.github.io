// Context/ResponsiveContext.tsx
import React, { createContext, useContext } from 'react';
import { useResponsive, ScreenSize } from '../hooks/useResponsive';

const ResponsiveContext = createContext<ScreenSize>({} as ScreenSize);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const screenSize = useResponsive();
  return (
    <ResponsiveContext.Provider value={screenSize}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useScreen = () => useContext(ResponsiveContext);

// Backward compatibility
export const useIsWide = () => {
  const { isWide } = useScreen();
  return isWide;
};