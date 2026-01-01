/**
 * Easing Functions Module
 *
 * A collection of easing functions for smooth animations and transitions.
 * Each function takes a normalized time value (0-1) and returns the eased value.
 */

/**
 * Type definition for an easing function
 * @param t - Normalized time value between 0 and 1
 * @returns The eased value, typically between 0 and 1
 */
export type EasingFunction = (t: number) => number;

/**
 * Collection of easing functions for animations
 */
export const ease = {
  /**
   * Linear easing - no acceleration
   * @param t - Normalized time (0-1)
   */
  linear: (t: number): number => t,

  /**
   * Quadratic ease-in - accelerating from zero velocity
   * @param t - Normalized time (0-1)
   */
  inQuad: (t: number): number => t * t,

  /**
   * Quadratic ease-out - decelerating to zero velocity
   * @param t - Normalized time (0-1)
   */
  outQuad: (t: number): number => t * (2 - t),

  /**
   * Quadratic ease-in-out - acceleration until halfway, then deceleration
   * @param t - Normalized time (0-1)
   */
  inOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /**
   * Cubic ease-in - accelerating from zero velocity (stronger than quad)
   * @param t - Normalized time (0-1)
   */
  inCubic: (t: number): number => t * t * t,

  /**
   * Cubic ease-out - decelerating to zero velocity (stronger than quad)
   * @param t - Normalized time (0-1)
   */
  outCubic: (t: number): number => (--t) * t * t + 1,

  /**
   * Cubic ease-in-out - acceleration until halfway, then deceleration (stronger than quad)
   * @param t - Normalized time (0-1)
   */
  inOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  /**
   * Exponential ease-out - very fast deceleration
   * @param t - Normalized time (0-1)
   */
  outExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

  /**
   * Exponential ease-in - very slow start, then rapid acceleration
   * @param t - Normalized time (0-1)
   */
  inExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),

  /**
   * Back ease-out - overshoots slightly before settling
   * @param t - Normalized time (0-1)
   */
  outBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  /**
   * Elastic ease-in - oscillates before accelerating
   * @param t - Normalized time (0-1)
   */
  elastic: (t: number): number => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),

  /**
   * Exponential ramp for final stretch - slow build to 30%, then explosion
   * Used for dramatic countdown effects where tension builds slowly
   * then releases explosively in the final moments.
   * @param t - Normalized time (0-1)
   */
  dramaticRamp: (t: number): number => {
    if (t < 0.83) return t / 0.83 * 0.3;
    const normalized = (t - 0.83) / 0.17;
    return 0.3 + Math.pow(normalized, 2.5) * 0.7;
  },

  /**
   * Super aggressive for final 10 seconds
   * Builds on dramaticRamp but adds extra intensity in the last 2%
   * of the animation for maximum impact at climax.
   * @param t - Normalized time (0-1)
   */
  finalCountdown: (t: number): number => {
    if (t < 0.98) return ease.dramaticRamp(t);
    const normalized = (t - 0.98) / 0.02;
    return 0.9 + Math.pow(normalized, 1.5) * 0.1;
  }
} as const;
