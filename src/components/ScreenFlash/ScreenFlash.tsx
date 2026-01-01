import { useState, useEffect, useRef } from 'react';
import type { Phase } from '@/types';

interface ScreenFlashProps {
  phase: Phase;
}

export function ScreenFlash({ phase }: ScreenFlashProps) {
  const [opacity, setOpacity] = useState(0);
  const [color, setColor] = useState('white');
  const hasFlashed = useRef(false);

  useEffect(() => {
    if (phase === 'climax' && !hasFlashed.current) {
      hasFlashed.current = true;

      // Multi-flash sequence for dramatic midnight effect
      // Initial bright white flash
      setColor('white');
      setOpacity(1);

      // Rapid strobe effect
      setTimeout(() => setOpacity(0.8), 40);
      setTimeout(() => setOpacity(1), 80);

      // Transition to gold
      setTimeout(() => {
        setColor('#FFD700');
        setOpacity(0.7);
      }, 120);
      setTimeout(() => setOpacity(0.9), 160);

      // Magenta flash
      setTimeout(() => {
        setColor('#FF00FF');
        setOpacity(0.5);
      }, 220);

      // Cyan flash
      setTimeout(() => {
        setColor('#00F5FF');
        setOpacity(0.4);
      }, 320);

      // Return to gold glow
      setTimeout(() => {
        setColor('#FFD700');
        setOpacity(0.3);
      }, 420);

      // Fade out
      setTimeout(() => setOpacity(0.15), 550);
      setTimeout(() => setOpacity(0), 700);
    }

    // Reset hasFlashed when phase changes away from climax
    if (phase !== 'climax' && phase !== 'celebration') {
      hasFlashed.current = false;
    }
  }, [phase]);

  if (opacity === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: color,
        opacity,
        pointerEvents: 'none',
        transition: 'opacity 0.05s ease-out, background-color 0.08s ease-out',
        zIndex: 1000
      }}
    />
  );
}

export default ScreenFlash;
