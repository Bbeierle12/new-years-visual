export type Phase = 'dormant' | 'calm' | 'building' | 'intense' | 'final' | 'climax' | 'celebration';

export interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface CountdownState {
  timeRemaining: number;
  progress: number;
  phase: Phase;
  display: TimeDisplay;
  isPast: boolean;
}
