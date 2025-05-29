import React, { createContext, useContext } from 'react';
import useAspectRatio from '../hooks/useAspectRatio';

const AspectRatioContext = createContext<boolean>(false);

export const AspectRatioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isWide = useAspectRatio();
  return (
    <AspectRatioContext.Provider value={isWide}>
      {children}
    </AspectRatioContext.Provider>
  );
};

export const useIsWide = () => useContext(AspectRatioContext);
