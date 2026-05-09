import { useCallback, useEffect, useRef, useState } from 'react';

const ROLL_ANIMATION_MS = 600;

export function useDiceAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const triggerRoll = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsAnimating(true);

    timeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      timeoutRef.current = null;
    }, ROLL_ANIMATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    triggerRoll,
  };
}
