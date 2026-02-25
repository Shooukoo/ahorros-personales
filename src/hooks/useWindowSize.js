// src/hooks/useWindowSize.js
import { useState, useEffect } from 'react';

/**
 * Returns the current window { width, height }.
 * Updates on resize with a 100ms debounce for performance.
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width:  typeof window !== 'undefined' ? window.innerWidth  : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    let timer;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return size;
}
