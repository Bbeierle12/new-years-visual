/**
 * Time Utilities Module
 *
 * Functions for calculating phases and formatting time displays
 * for the New Year's countdown visualization.
 */

import type { Phase, TimeDisplay } from '@/types';
import { PHASE_THRESHOLDS } from '@/constants';

/**
 * Calculate the current phase based on remaining time until midnight.
 *
 * Phases represent different intensity levels of the countdown:
 * - dormant: More than 10 minutes remaining (minimal effects)
 * - calm: 10 minutes to 5 minutes (subtle ambient effects)
 * - building: 5 minutes to 1 minute (increasing intensity)
 * - intense: 1 minute to 10 seconds (high energy)
 * - final: 10 seconds to 0 (maximum intensity countdown)
 * - climax: 0 to celebration delay (the moment of midnight)
 * - celebration: After celebration delay (fireworks and celebration)
 *
 * @param remaining - Remaining time in milliseconds (can be negative after midnight)
 * @returns The current phase identifier
 *
 * @example
 * ```ts
 * const phase = calculatePhase(5000); // Returns 'final' (5 seconds remaining)
 * const phase = calculatePhase(-1000); // Returns 'climax' (1 second past midnight)
 * ```
 */
export function calculatePhase(remaining: number): Phase {
  if (remaining <= -PHASE_THRESHOLDS.celebrationDelay) return 'celebration';
  if (remaining <= 0) return 'climax';
  if (remaining <= PHASE_THRESHOLDS.final) return 'final';
  if (remaining <= PHASE_THRESHOLDS.intense) return 'intense';
  if (remaining <= PHASE_THRESHOLDS.building) return 'building';
  if (remaining <= PHASE_THRESHOLDS.calm) return 'calm';
  return 'dormant';
}

/**
 * Format remaining milliseconds into display components.
 *
 * Converts a raw millisecond value into hours, minutes, seconds,
 * and milliseconds for rendering the countdown display.
 * All values are floored/clamped to prevent negative numbers.
 *
 * @param remaining - Remaining time in milliseconds
 * @returns Object containing hours, minutes, seconds, and milliseconds
 *
 * @example
 * ```ts
 * const display = formatTimeDisplay(3661500);
 * // Returns: { hours: 1, minutes: 1, seconds: 1, milliseconds: 500 }
 *
 * const display = formatTimeDisplay(0);
 * // Returns: { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }
 * ```
 */
export function formatTimeDisplay(remaining: number): TimeDisplay {
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    milliseconds: Math.max(0, remaining % 1000)
  };
}
