import type { Phase, CountdownState } from '@/types';
import {
  getContainerStyles,
  getPhaseTagStyles,
  getSliderStyles,
  getPresetButtonStyles,
  PHASE_COLORS
} from './DebugControls.styles';

interface DebugControlsProps {
  progress: number;
  setDebugProgress: (progress: number) => void;
  phase: Phase;
  useDebug: boolean;
  setUseDebug: (use: boolean) => void;
  countdown: CountdownState;
}

const PRESETS = [
  { p: 0, label: '0%', desc: 'Start' },
  { p: 0.5, label: '50%', desc: 'Mid' },
  { p: 0.83, label: '83%', desc: 'Build' },
  { p: 0.95, label: '95%', desc: 'Intense' },
  { p: 0.99, label: '99%', desc: 'Final' },
  { p: 1.0, label: '🎆', desc: 'Climax' },
  { p: 1.1, label: '🎉', desc: 'Party' }
];

export function DebugControls({
  progress,
  setDebugProgress,
  phase,
  useDebug,
  setUseDebug,
  countdown
}: DebugControlsProps) {
  const { display } = countdown;

  return (
    <div style={getContainerStyles()}>
      {/* Header row with toggle, phase tag, progress %, time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useDebug}
            onChange={(e) => setUseDebug(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: PHASE_COLORS[phase] }}
          />
          <span>Debug Mode</span>
        </label>
        <span style={getPhaseTagStyles(phase)}>{phase}</span>
        <span style={{ color: '#9ca3af' }}>{(progress * 100).toFixed(1)}%</span>
        {!useDebug && (
          <span style={{ color: '#6b7280', fontSize: '11px' }}>
            T-{display.hours}:{String(display.minutes).padStart(2,'0')}:{String(display.seconds).padStart(2,'0')}
          </span>
        )}
      </div>

      {useDebug && (
        <>
          {/* Slider */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress * 100}
            onChange={(e) => setDebugProgress(parseFloat(e.target.value) / 100)}
            style={getSliderStyles(phase)}
          />

          {/* Phase labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span>Dormant</span>
            <span>Calm</span>
            <span>Building</span>
            <span>Intense</span>
            <span>Final</span>
            <span>Climax</span>
            <span>🎆</span>
          </div>

          {/* Preset buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            {PRESETS.map(({ p, label, desc }) => (
              <button
                key={p}
                onClick={() => setDebugProgress(Math.min(p, 1.001))}
                title={desc}
                style={getPresetButtonStyles(Math.abs(progress - p) < 0.01, phase)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
