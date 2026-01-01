/**
 * Phase transition thresholds in milliseconds
 * Defines when the countdown transitions between different visual phases
 */
export const PHASE_THRESHOLDS = {
  /** 1 hour - calm ambient visuals */
  calm: 60 * 60 * 1000,

  /** 10 minutes - building anticipation */
  building: 10 * 60 * 1000,

  /** 1 minute - intense buildup */
  intense: 60 * 1000,

  /** 10 seconds - final countdown */
  final: 10 * 1000,

  /** 0 - the climax moment */
  climax: 0,

  /** Delay before celebration starts (6 seconds) */
  celebrationDelay: 6000
} as const;

export type PhaseThreshold = keyof typeof PHASE_THRESHOLDS;
