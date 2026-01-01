import { describe, it, expect } from 'vitest';
import { smoothLerp, clamp, lerp } from '@/utils/math';

describe('smoothLerp', () => {
  it('moves toward target', () => {
    const result = smoothLerp(0, 100, 0.5, 0.016);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });

  it('returns current when speed is 0', () => {
    expect(smoothLerp(50, 100, 0, 0.016)).toBe(50);
  });

  it('moves faster with higher speed', () => {
    const slowResult = smoothLerp(0, 100, 0.1, 0.016);
    const fastResult = smoothLerp(0, 100, 0.5, 0.016);
    expect(fastResult).toBeGreaterThan(slowResult);
  });

  it('moves more with larger delta time', () => {
    const smallDt = smoothLerp(0, 100, 0.5, 0.008);
    const largeDt = smoothLerp(0, 100, 0.5, 0.032);
    expect(largeDt).toBeGreaterThan(smallDt);
  });

  it('handles negative targets', () => {
    const result = smoothLerp(0, -100, 0.5, 0.016);
    expect(result).toBeLessThan(0);
    expect(result).toBeGreaterThan(-100);
  });

  it('handles current greater than target', () => {
    const result = smoothLerp(100, 0, 0.5, 0.016);
    expect(result).toBeLessThan(100);
    expect(result).toBeGreaterThan(0);
  });

  it('returns current when already at target', () => {
    const result = smoothLerp(50, 50, 0.5, 0.016);
    expect(result).toBe(50);
  });

  it('is frame-rate independent (larger dt compensates fewer frames)', () => {
    // Two frames at 60fps (dt=0.016) vs one frame at 30fps (dt=0.032)
    const twoSmallSteps = smoothLerp(
      smoothLerp(0, 100, 0.5, 0.016),
      100,
      0.5,
      0.016
    );
    const oneLargeStep = smoothLerp(0, 100, 0.5, 0.032);
    // They should be approximately equal due to the exponential compensation
    expect(Math.abs(twoSmallSteps - oneLargeStep)).toBeLessThan(5);
  });
});

describe('clamp', () => {
  it('clamps below minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps above maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns value when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns minimum when value equals minimum', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns maximum when value equals maximum', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(0, -10, -1)).toBe(-1);
    expect(clamp(-15, -10, -1)).toBe(-10);
  });

  it('handles floating point values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(1.5, 0, 1)).toBe(1);
    expect(clamp(-0.5, 0, 1)).toBe(0);
  });

  it('handles zero range (min equals max)', () => {
    expect(clamp(5, 5, 5)).toBe(5);
    expect(clamp(0, 5, 5)).toBe(5);
    expect(clamp(10, 5, 5)).toBe(5);
  });
});

describe('lerp', () => {
  it('returns start when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns end when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it('handles t=0.25', () => {
    expect(lerp(0, 100, 0.25)).toBe(25);
  });

  it('handles t=0.75', () => {
    expect(lerp(0, 100, 0.75)).toBe(75);
  });

  it('handles negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
    expect(lerp(-20, -10, 0.5)).toBe(-15);
  });

  it('handles reversed range (start > end)', () => {
    expect(lerp(100, 0, 0.25)).toBe(75);
    expect(lerp(100, 0, 0.5)).toBe(50);
    expect(lerp(100, 0, 0.75)).toBe(25);
  });

  it('handles t values outside 0-1 range (extrapolation)', () => {
    expect(lerp(0, 10, 1.5)).toBe(15);
    expect(lerp(0, 10, -0.5)).toBe(-5);
  });

  it('handles floating point precision', () => {
    expect(lerp(0, 1, 0.1)).toBeCloseTo(0.1, 10);
    expect(lerp(0, 1, 0.3)).toBeCloseTo(0.3, 10);
  });

  it('handles same start and end values', () => {
    expect(lerp(5, 5, 0)).toBe(5);
    expect(lerp(5, 5, 0.5)).toBe(5);
    expect(lerp(5, 5, 1)).toBe(5);
  });
});
