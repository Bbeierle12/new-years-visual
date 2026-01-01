import { describe, it, expect } from 'vitest';
import { ease } from '@/utils/easing';

describe('easing functions', () => {
  describe('linear', () => {
    it('returns input value unchanged', () => {
      expect(ease.linear(0)).toBe(0);
      expect(ease.linear(0.5)).toBe(0.5);
      expect(ease.linear(1)).toBe(1);
    });

    it('handles arbitrary values linearly', () => {
      expect(ease.linear(0.25)).toBe(0.25);
      expect(ease.linear(0.75)).toBe(0.75);
    });
  });

  describe('inQuad', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.inQuad(0)).toBe(0);
      expect(ease.inQuad(1)).toBe(1);
    });

    it('accelerates (value < input for middle values)', () => {
      expect(ease.inQuad(0.5)).toBeLessThan(0.5);
    });

    it('follows t^2 curve', () => {
      expect(ease.inQuad(0.5)).toBe(0.25);
      expect(ease.inQuad(0.25)).toBe(0.0625);
    });
  });

  describe('outQuad', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.outQuad(0)).toBe(0);
      expect(ease.outQuad(1)).toBe(1);
    });

    it('decelerates (value > input for middle values)', () => {
      expect(ease.outQuad(0.5)).toBeGreaterThan(0.5);
    });

    it('follows t * (2 - t) curve', () => {
      expect(ease.outQuad(0.5)).toBe(0.75);
    });
  });

  describe('inOutQuad', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.inOutQuad(0)).toBe(0);
      expect(ease.inOutQuad(1)).toBe(1);
    });

    it('returns 0.5 at midpoint', () => {
      expect(ease.inOutQuad(0.5)).toBe(0.5);
    });

    it('accelerates in first half', () => {
      expect(ease.inOutQuad(0.25)).toBeLessThan(0.25);
    });

    it('decelerates in second half', () => {
      expect(ease.inOutQuad(0.75)).toBeGreaterThan(0.75);
    });
  });

  describe('inCubic', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.inCubic(0)).toBe(0);
      expect(ease.inCubic(1)).toBe(1);
    });

    it('follows t^3 curve', () => {
      expect(ease.inCubic(0.5)).toBe(0.125);
    });

    it('accelerates slower than inQuad at start', () => {
      expect(ease.inCubic(0.5)).toBeLessThan(ease.inQuad(0.5));
    });
  });

  describe('outCubic', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.outCubic(0)).toBe(0);
      expect(ease.outCubic(1)).toBe(1);
    });

    it('decelerates (value > input for middle values)', () => {
      expect(ease.outCubic(0.5)).toBeGreaterThan(0.5);
    });
  });

  describe('inOutCubic', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.inOutCubic(0)).toBe(0);
      expect(ease.inOutCubic(1)).toBe(1);
    });

    it('returns 0.5 at midpoint', () => {
      expect(ease.inOutCubic(0.5)).toBe(0.5);
    });
  });

  describe('outExpo', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.outExpo(0)).toBeCloseTo(0, 5);
      expect(ease.outExpo(1)).toBe(1);
    });

    it('decelerates very quickly', () => {
      // At t=0.5, outExpo should be very close to 1
      expect(ease.outExpo(0.5)).toBeGreaterThan(0.9);
    });
  });

  describe('inExpo', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.inExpo(0)).toBe(0);
      expect(ease.inExpo(1)).toBeCloseTo(1, 5);
    });

    it('starts very slowly', () => {
      // At t=0.5, inExpo should still be very small
      expect(ease.inExpo(0.5)).toBeLessThan(0.1);
    });
  });

  describe('outBack', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.outBack(0)).toBeCloseTo(0, 5);
      expect(ease.outBack(1)).toBe(1);
    });

    it('overshoots past 1 before settling', () => {
      // outBack should overshoot somewhere in the middle
      const maxValue = Math.max(
        ease.outBack(0.6),
        ease.outBack(0.7),
        ease.outBack(0.8),
        ease.outBack(0.9)
      );
      expect(maxValue).toBeGreaterThan(1);
    });
  });

  describe('elastic', () => {
    it('returns 0 at start and 1 at end', () => {
      expect(ease.elastic(0)).toBe(0);
      expect(ease.elastic(1)).toBe(1);
    });

    it('oscillates (has negative values)', () => {
      // Elastic easing can produce negative values during oscillation
      let hasNegative = false;
      for (let t = 0; t <= 1; t += 0.01) {
        if (ease.elastic(t) < 0) {
          hasNegative = true;
          break;
        }
      }
      expect(hasNegative).toBe(true);
    });
  });

  describe('dramaticRamp', () => {
    it('returns 0 at start and ~1 at end', () => {
      expect(ease.dramaticRamp(0)).toBe(0);
      expect(ease.dramaticRamp(1)).toBeCloseTo(1, 10);
    });

    it('returns ~0.3 at 83% progress', () => {
      expect(ease.dramaticRamp(0.83)).toBeCloseTo(0.3, 1);
    });

    it('builds slowly in first 83%', () => {
      expect(ease.dramaticRamp(0.5)).toBeLessThan(0.2);
    });

    it('accelerates rapidly after 83%', () => {
      expect(ease.dramaticRamp(0.95)).toBeGreaterThan(0.5);
    });
  });

  describe('finalCountdown', () => {
    it('returns 0 at start and ~1 at end', () => {
      expect(ease.finalCountdown(0)).toBe(0);
      expect(ease.finalCountdown(1)).toBeCloseTo(1, 10);
    });

    it('follows dramaticRamp for most of the duration', () => {
      expect(ease.finalCountdown(0.5)).toBe(ease.dramaticRamp(0.5));
      expect(ease.finalCountdown(0.83)).toBeCloseTo(ease.dramaticRamp(0.83), 5);
    });

    it('has extra intensity in final 2%', () => {
      // At 98%, finalCountdown uses dramaticRamp
      // After 98%, it uses a special curve
      const at98 = ease.finalCountdown(0.98);
      const at99 = ease.finalCountdown(0.99);
      expect(at99).toBeGreaterThan(at98);
    });

    it('reaches ~0.9 at 98% progress', () => {
      expect(ease.finalCountdown(0.98)).toBeCloseTo(0.9, 1);
    });
  });

  describe('edge cases', () => {
    it('all easing functions handle 0 input', () => {
      expect(ease.linear(0)).toBe(0);
      expect(ease.inQuad(0)).toBe(0);
      expect(ease.outQuad(0)).toBe(0);
      expect(ease.inOutQuad(0)).toBe(0);
      expect(ease.inCubic(0)).toBe(0);
      expect(ease.outCubic(0)).toBe(0);
      expect(ease.inOutCubic(0)).toBe(0);
      expect(ease.inExpo(0)).toBe(0);
      expect(ease.elastic(0)).toBe(0);
      expect(ease.dramaticRamp(0)).toBe(0);
      expect(ease.finalCountdown(0)).toBe(0);
    });

    it('all easing functions handle 1 input', () => {
      expect(ease.linear(1)).toBe(1);
      expect(ease.inQuad(1)).toBe(1);
      expect(ease.outQuad(1)).toBe(1);
      expect(ease.inOutQuad(1)).toBe(1);
      expect(ease.inCubic(1)).toBe(1);
      expect(ease.outCubic(1)).toBe(1);
      expect(ease.inOutCubic(1)).toBe(1);
      expect(ease.outExpo(1)).toBe(1);
      expect(ease.elastic(1)).toBe(1);
      // dramaticRamp and finalCountdown have slight floating point precision issues
      expect(ease.dramaticRamp(1)).toBeCloseTo(1, 10);
      expect(ease.finalCountdown(1)).toBeCloseTo(1, 10);
    });
  });
});
