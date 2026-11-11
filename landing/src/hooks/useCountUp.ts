import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const easeOutQuart = (progress: number) => 1 - Math.pow(1 - progress, 4);

export function useCountUp(active: boolean, duration = 1000) {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      setProgress(1);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const linear = Math.min(1, (now - start) / duration);
      setProgress(easeOutQuart(linear));
      if (linear < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, reducedMotion]);

  return progress;
}
