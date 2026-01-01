import type { CSSProperties } from 'react';
import type { Phase } from '@/types';

export function getContainerStyles(
  glitchOffset: number,
  textShakeX: number,
  textShakeY: number,
  scale: number,
  celebrationPulse: number
): CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) translateX(${glitchOffset + textShakeX}px) translateY(${textShakeY}px) scale(${scale * celebrationPulse})`,
    textAlign: 'center',
    transition: 'transform 0.1s ease-out'
  };
}

export function getTimeStyles(
  _phase: Phase,
  fontSize: string,
  color: string,
  glowColor: string,
  chromatic: number,
  dramaticIntensity: number,
  isCelebration: boolean
): CSSProperties {
  if (isCelebration) {
    return {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize,
      fontWeight: 700,
      color: '#C0C0C0',
      textShadow: `
        -2px -2px 0 #FFD700,
        2px -2px 0 #FFD700,
        -2px 2px 0 #FFD700,
        2px 2px 0 #FFD700,
        0 0 30px #FFD700,
        0 0 60px #FFA500,
        0 0 90px #FF6347,
        0 0 120px #FFD700
      `,
      letterSpacing: '0.05em',
      lineHeight: 1,
      margin: 0,
      padding: 0
    };
  }

  const chromaticOffset = chromatic * dramaticIntensity;

  return {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize,
    fontWeight: 700,
    color,
    textShadow: `
      ${-chromaticOffset}px 0 0 rgba(255, 0, 100, 0.8),
      ${chromaticOffset}px 0 0 rgba(0, 255, 255, 0.8),
      0 0 20px ${glowColor},
      0 0 40px ${glowColor},
      0 0 60px ${glowColor}
    `,
    letterSpacing: '0.05em',
    lineHeight: 1,
    margin: 0,
    padding: 0,
    transition: 'color 0.3s ease, text-shadow 0.3s ease'
  };
}

export function getSubtitleStyles(phase: Phase): CSSProperties {
  const isClimax = phase === 'climax';

  return {
    fontFamily: "'Great Vibes', cursive",
    fontSize: isClimax ? '6vw' : '4vw',
    fontWeight: 400,
    color: '#C0C0C0',
    textShadow: `
      -1px -1px 0 #FFD700,
      1px -1px 0 #FFD700,
      -1px 1px 0 #FFD700,
      1px 1px 0 #FFD700,
      0 0 20px #FFD700,
      0 0 40px #FFA500
    `,
    marginTop: '1rem',
    animation: 'shimmer 2s ease-in-out infinite',
    letterSpacing: '0.02em'
  };
}

export function getFlashOverlayStyles(flashOpacity: number): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'white',
    opacity: flashOpacity,
    pointerEvents: 'none',
    transition: 'opacity 0.15s ease-out'
  };
}

export function getDecorativeStarStyles(
  index: number,
  total: number,
  time: number
): CSSProperties {
  const angle = (index / total) * Math.PI * 2;
  const radius = 120 + Math.sin(time * 0.002 + index) * 20;
  const x = Math.cos(angle + time * 0.001) * radius;
  const y = Math.sin(angle + time * 0.001) * radius;
  const scale = 0.8 + Math.sin(time * 0.003 + index * 0.5) * 0.4;
  const opacity = 0.6 + Math.sin(time * 0.004 + index) * 0.4;

  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
    fontSize: '2rem',
    color: '#FFD700',
    textShadow: '0 0 10px #FFD700, 0 0 20px #FFA500',
    opacity,
    animation: 'twinkle 1.5s ease-in-out infinite',
    animationDelay: `${index * 0.1}s`,
    pointerEvents: 'none'
  };
}

export function getGlowLayerStyles(color: string, blur: number, opacity: number): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    filter: `blur(${blur}px)`,
    opacity,
    pointerEvents: 'none'
  };
}

export const keyframeStyles = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes shimmer {
    0%, 100% {
      filter: brightness(1);
      text-shadow:
        -1px -1px 0 #FFD700,
        1px -1px 0 #FFD700,
        -1px 1px 0 #FFD700,
        1px 1px 0 #FFD700,
        0 0 20px #FFD700,
        0 0 40px #FFA500;
    }
    50% {
      filter: brightness(1.3);
      text-shadow:
        -1px -1px 0 #FFD700,
        1px -1px 0 #FFD700,
        -1px 1px 0 #FFD700,
        1px 1px 0 #FFD700,
        0 0 30px #FFD700,
        0 0 60px #FFA500,
        0 0 80px #FF6347;
    }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }
`;
