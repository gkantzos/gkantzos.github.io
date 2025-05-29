import { useState, useEffect } from 'react';

function useAspectRatio() {
  const [isWide, setIsWide] = useState(window.innerWidth / window.innerHeight >= 16 / 9);

  useEffect(() => {
    function onResize() {
      setIsWide(window.innerWidth / window.innerHeight >= 16 / 9);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isWide;
}

export default useAspectRatio;
