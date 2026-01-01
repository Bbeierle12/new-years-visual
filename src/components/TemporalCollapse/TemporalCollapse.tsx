import { useRef, useState, useEffect, useMemo } from 'react';
import { useCountdown } from '@/hooks';
import { PHASE_THRESHOLDS } from '@/constants';
import { TemporalCollapseScene } from '@/scene';
import { CountdownDisplay } from '../CountdownDisplay/CountdownDisplay';
import { ScreenFlash } from '../ScreenFlash/ScreenFlash';
import { DebugControls } from '../DebugControls/DebugControls';
import type { CountdownState, Phase } from '@/types';

export function TemporalCollapse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TemporalCollapseScene | null>(null);

  const [targetDate] = useState(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
  });

  const [useDebug, setUseDebug] = useState(false);
  const [debugProgress, setDebugProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);

  const realCountdown = useCountdown(targetDate);

  // Calculate countdown state (real or debug)
  const countdown = useMemo<CountdownState>(() => {
    if (!useDebug) return realCountdown;

    const totalDuration = 60 * 60 * 1000;
    const remaining = totalDuration * (1 - Math.min(debugProgress, 1));

    let phase: Phase = 'dormant';
    if (debugProgress >= 1.001) phase = 'celebration';
    else if (debugProgress >= 1) phase = 'climax';
    else if (remaining <= PHASE_THRESHOLDS.final) phase = 'final';
    else if (remaining <= PHASE_THRESHOLDS.intense) phase = 'intense';
    else if (remaining <= PHASE_THRESHOLDS.building) phase = 'building';
    else if (remaining <= PHASE_THRESHOLDS.calm) phase = 'calm';

    const totalSeconds = Math.max(0, Math.floor(remaining / 1000));

    return {
      timeRemaining: remaining,
      progress: debugProgress,
      phase,
      display: {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        milliseconds: Math.floor(remaining % 1000)
      },
      isPast: debugProgress >= 1
    };
  }, [useDebug, debugProgress, realCountdown]);

  // Smooth progress animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setSmoothProgress(prev => prev + (countdown.progress - prev) * 0.12);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [countdown.progress]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    sceneRef.current = new TemporalCollapseScene(containerRef.current);
    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, []);

  // Update scene on progress/phase change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateProgress(countdown.progress, countdown.phase);
    }
  }, [countdown.progress, countdown.phase]);

  // Calculate vignette intensity
  const vignetteIntensity = countdown.progress > 0.83
    ? 0.4 + Math.pow((countdown.progress - 0.83) / 0.17, 2) * 0.5
    : 0.4 + countdown.progress * 0.2;

  return (
    <div style={{ width: '100%', height: '100vh', background: '#050508', position: 'relative', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      <CountdownDisplay
        display={countdown.display}
        phase={countdown.phase}
        progress={countdown.progress}
        smoothProgress={smoothProgress}
      />

      <ScreenFlash phase={countdown.phase} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center, transparent 0%, transparent ${35 - countdown.progress * 20}%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
        pointerEvents: 'none'
      }} />

      <DebugControls
        progress={countdown.progress}
        setDebugProgress={setDebugProgress}
        phase={countdown.phase}
        useDebug={useDebug}
        setUseDebug={setUseDebug}
        countdown={countdown}
      />

      {/* Mode indicator */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'monospace',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {useDebug ? '⚙ Debug' : '● Live'}
      </div>
    </div>
  );
}
