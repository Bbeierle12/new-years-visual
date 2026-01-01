import { useState, useEffect, useMemo } from 'react';
import type { Phase, TimeDisplay } from '@/types';
import {
  getContainerStyles,
  getTimeStyles,
  getSubtitleStyles,
  getFlashOverlayStyles,
  getDecorativeStarStyles,
  keyframeStyles
} from './CountdownDisplay.styles';

interface CountdownDisplayProps {
  display: TimeDisplay;
  phase: Phase;
  progress: number;
  smoothProgress: number;
}

export function CountdownDisplay({ display, phase, progress, smoothProgress: _smoothProgress }: CountdownDisplayProps) {
  const [scale, setScale] = useState(1);
  const [glitchOffset, setGlitchOffset] = useState(0);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [textShakeX, setTextShakeX] = useState(0);
  const [textShakeY, setTextShakeY] = useState(0);
  const [celebrationPulse, setCelebrationPulse] = useState(1);
  const [animationTime, setAnimationTime] = useState(0);

  // Calculate dramatic intensity - ramps up in the final 17% of countdown
  const dramaticIntensity = progress > 0.83 ? Math.pow((progress - 0.83) / 0.17, 2.5) : 0;

  // Chromatic aberration intensity
  const chromatic = useMemo(() => {
    if (phase === 'final') return 8;
    if (phase === 'intense') return 4;
    if (phase === 'building') return 2;
    return 0;
  }, [phase]);

  // Animation time for decorative elements
  useEffect(() => {
    const isCelebration = phase === 'climax' || phase === 'celebration';
    if (!isCelebration) return;

    const interval = setInterval(() => {
      setAnimationTime(Date.now());
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // Celebration pulse effect
  useEffect(() => {
    if (phase === 'climax' || phase === 'celebration') {
      const interval = setInterval(() => {
        setCelebrationPulse(1 + Math.sin(Date.now() * 0.003) * 0.05);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setCelebrationPulse(1);
    }
  }, [phase]);

  // Pulse effect on second change
  useEffect(() => {
    if (phase === 'final') {
      setScale(1.25);
      setFlashOpacity(0.3);
      setTimeout(() => setScale(1.1), 100);
      setTimeout(() => setScale(1), 200);
      setTimeout(() => setFlashOpacity(0), 150);
    } else if (phase === 'intense') {
      setScale(1.08);
      setTimeout(() => setScale(1), 150);
    }
  }, [display.seconds, phase]);

  // Glitch effect
  useEffect(() => {
    if (phase === 'intense' || phase === 'final' || phase === 'building') {
      const interval = setInterval(() => {
        const glitchChance = phase === 'final' ? 0.6 : phase === 'intense' ? 0.4 : 0.2;
        if (Math.random() < glitchChance) {
          const intensity = phase === 'final' ? 25 : phase === 'intense' ? 15 : 8;
          setGlitchOffset((Math.random() - 0.5) * intensity * Math.max(dramaticIntensity, 0.3));
          setTimeout(() => setGlitchOffset(0), 30 + Math.random() * 40);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, [phase, dramaticIntensity]);

  // Text shake effect for intense phases
  useEffect(() => {
    if (phase === 'final' || phase === 'intense') {
      const interval = setInterval(() => {
        const shakeIntensity = phase === 'final' ? 3 : 1.5;
        setTextShakeX((Math.random() - 0.5) * shakeIntensity * dramaticIntensity);
        setTextShakeY((Math.random() - 0.5) * shakeIntensity * dramaticIntensity);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setTextShakeX(0);
      setTextShakeY(0);
    }
  }, [phase, dramaticIntensity]);

  // Determine display text and formatting
  let timeString: string;
  let fontSize = '8vw';
  let subtitle: string | null = null;
  const isCelebration = phase === 'climax' || phase === 'celebration';

  if (phase === 'climax') {
    timeString = '2026';
    fontSize = '18vw';
    subtitle = 'Happy New Year';
  } else if (phase === 'celebration') {
    timeString = '2026';
    fontSize = '15vw';
    subtitle = 'Happy New Year';
  } else if (phase === 'final') {
    timeString = `${display.seconds}`;
    fontSize = '22vw';
  } else if (display.hours === 0 && display.minutes < 10) {
    timeString = `${String(display.minutes).padStart(2, '0')}:${String(display.seconds).padStart(2, '0')}`;
    fontSize = '12vw';
  } else {
    timeString = `${String(display.hours).padStart(2, '0')}:${String(display.minutes).padStart(2, '0')}:${String(display.seconds).padStart(2, '0')}`;
  }

  // Color calculations based on phase
  const getColors = () => {
    switch (phase) {
      case 'dormant':
      case 'calm':
        return { color: '#E8E8E8', glow: 'rgba(255, 255, 255, 0.3)' };
      case 'building':
        return { color: '#FFE4B5', glow: 'rgba(255, 215, 0, 0.4)' };
      case 'intense':
        return { color: '#FFA500', glow: 'rgba(255, 140, 0, 0.6)' };
      case 'final':
        return { color: '#FF4500', glow: 'rgba(255, 69, 0, 0.8)' };
      case 'climax':
      case 'celebration':
        return { color: '#C0C0C0', glow: 'rgba(255, 215, 0, 0.9)' };
      default:
        return { color: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.5)' };
    }
  };

  const { color, glow } = getColors();

  // Decorative stars for celebration
  const decorativeStars = useMemo(() => {
    if (!isCelebration) return null;
    const stars = [];
    const starCount = 12;
    for (let i = 0; i < starCount; i++) {
      stars.push(
        <span
          key={i}
          style={getDecorativeStarStyles(i, starCount, animationTime)}
        >
          {i % 2 === 0 ? '\u2726' : '\u2605'}
        </span>
      );
    }
    return stars;
  }, [isCelebration, animationTime]);

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Great+Vibes&display=swap"
        rel="stylesheet"
      />

      {/* Keyframe animations */}
      <style>{keyframeStyles}</style>

      {/* Flash overlay for dramatic moments */}
      {flashOpacity > 0 && (
        <div style={getFlashOverlayStyles(flashOpacity)} />
      )}

      {/* Main container */}
      <div style={getContainerStyles(glitchOffset, textShakeX, textShakeY, scale, celebrationPulse)}>
        {/* Decorative stars */}
        {decorativeStars}

        {/* Main time display */}
        <h1 style={getTimeStyles(phase, fontSize, color, glow, chromatic, dramaticIntensity, isCelebration)}>
          {timeString}
        </h1>

        {/* Subtitle for celebration */}
        {subtitle && (
          <p style={getSubtitleStyles(phase)}>
            {subtitle}
          </p>
        )}
      </div>
    </>
  );
}

export default CountdownDisplay;
