/**
 * Math Utilities Module
 *
 * Common mathematical functions for animations and interpolation.
 */

/**
 * Smooth interpolation with delta time compensation.
 *
 * This function provides frame-rate independent smoothing by compensating
 * for varying delta times. The result is consistent smooth transitions
 * regardless of the actual frame rate.
 *
 * @param current - The current value
 * @param target - The target value to interpolate towards
 * @param speed - The interpolation speed (0-1, where 1 is instant)
 * @param dt - Delta time in seconds since last frame
 * @returns The interpolated value
 *
 * @example
 * ```ts
 * // Smooth camera follow
 * cameraX = smoothLerp(cameraX, targetX, 0.1, deltaTime);
 * ```
 */
export function smoothLerp(current: number, target: number, speed: number, dt: number): number {
  const factor = 1 - Math.pow(1 - speed, dt * 60);
  return current + (target - current) * factor;
}

/**
 * Clamp a value between minimum and maximum bounds.
 *
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value
 *
 * @example
 * ```ts
 * const volume = clamp(rawVolume, 0, 1); // Ensures 0 <= volume <= 1
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values.
 *
 * @param a - The start value
 * @param b - The end value
 * @param t - The interpolation factor (0-1)
 * @returns The interpolated value
 *
 * @example
 * ```ts
 * const midpoint = lerp(0, 100, 0.5); // Returns 50
 * const color = lerp(startColor, endColor, progress);
 * ```
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
