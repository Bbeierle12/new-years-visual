import { useState, useEffect } from 'react';
import type { CountdownState, Phase, TimeDisplay } from '@/types';
import { PHASE_THRESHOLDS } from '@/constants';

function calculatePhase(remaining: number): Phase {
  if (remaining <= -PHASE_THRESHOLDS.celebrationDelay) return 'celebration';
  if (remaining <= 0) return 'climax';
  if (remaining <= PHASE_THRESHOLDS.final) return 'final';
  if (remaining <= PHASE_THRESHOLDS.intense) return 'intense';
  if (remaining <= PHASE_THRESHOLDS.building) return 'building';
  if (remaining <= PHASE_THRESHOLDS.calm) return 'calm';
  return 'dormant';
}

function formatTimeDisplay(remaining: number): TimeDisplay {
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    milliseconds: Math.max(0, remaining % 1000)
  };
}

function calculateState(targetDate: number): CountdownState {
  const now = Date.now();
  const remaining = targetDate - now;
  const totalDuration = 60 * 60 * 1000;
  const progress = Math.max(0, Math.min(1, 1 - (remaining / totalDuration)));

  return {
    timeRemaining: remaining,
    progress,
    phase: calculatePhase(remaining),
    display: formatTimeDisplay(remaining),
    isPast: remaining <= 0
  };
}

export function useCountdown(targetDate: number): CountdownState {
  const [state, setState] = useState<CountdownState>(() => calculateState(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setState(calculateState(targetDate));
    }, 50);
    return () => clearInterval(interval);
  }, [targetDate]);

  return state;
}
