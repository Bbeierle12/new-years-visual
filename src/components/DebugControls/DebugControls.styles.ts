import type { CSSProperties } from 'react';
import type { Phase } from '@/types';

export const PHASE_COLORS: Record<Phase, string> = {
  dormant: '#6b7280',
  calm: '#00F5FF',
  building: '#FF00FF',
  intense: '#f97316',
  final: '#ef4444',
  climax: '#FFD700',
  celebration: '#22c55e'
};

export function getContainerStyles(): CSSProperties {
  return {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    right: '16px',
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '20px',
    color: 'white',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '13px',
    border: '1px solid rgba(255,255,255,0.1)'
  };
}

export function getPhaseTagStyles(phase: Phase): CSSProperties {
  const isLight = ['climax', 'calm', 'celebration'].includes(phase);
  return {
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: PHASE_COLORS[phase],
    color: isLight ? '#000' : '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };
}

export function getSliderStyles(phase: Phase): CSSProperties {
  return {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    cursor: 'pointer',
    accentColor: PHASE_COLORS[phase],
    background: 'linear-gradient(to right, #00F5FF 0%, #FF00FF 50%, #FFD700 100%)'
  };
}

export function getPresetButtonStyles(isActive: boolean, phase: Phase): CSSProperties {
  const isLight = ['climax', 'calm', 'celebration'].includes(phase);
  return {
    padding: '8px 14px',
    background: isActive ? PHASE_COLORS[phase] : 'rgba(55,65,81,0.8)',
    border: 'none',
    borderRadius: '8px',
    color: isActive && isLight ? '#000' : '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease'
  };
}
