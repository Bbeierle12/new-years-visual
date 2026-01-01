import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('phase calculation', () => {
    it('returns dormant phase when more than 1 hour remaining', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // 2 hours remaining
      const target = now + 2 * 60 * 60 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.phase).toBe('dormant');
    });

    it('returns calm phase when less than 1 hour remaining', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // 30 minutes remaining
      const target = now + 30 * 60 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.phase).toBe('calm');
    });

    it('returns building phase when less than 10 minutes remaining', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // 5 minutes remaining
      const target = now + 5 * 60 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.phase).toBe('building');
    });

    it('returns intense phase when less than 1 minute remaining', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // 30 seconds remaining
      const target = now + 30 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.phase).toBe('intense');
    });

    it('returns final phase when less than 10 seconds remaining', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // 5 seconds remaining
      const target = now + 5 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.phase).toBe('final');
    });

    it('returns climax phase when time has just passed', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // 2 seconds ago
      const target = now - 2 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.phase).toBe('climax');
    });

    it('returns celebration phase after climax delay', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // 10 seconds ago (past celebration delay of 6 seconds)
      const target = now - 10 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.phase).toBe('celebration');
    });
  });

  describe('time display', () => {
    it('displays correct time format', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + (1 * 3600 + 30 * 60 + 45) * 1000;
      const { result } = renderHook(() => useCountdown(target));

      // Should show approximately 1:30:45
      expect(result.current.display.hours).toBe(1);
      expect(result.current.display.minutes).toBe(30);
      expect(result.current.display.seconds).toBe(45);
    });

    it('displays zero when time has passed', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now - 5000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.display.hours).toBe(0);
      expect(result.current.display.minutes).toBe(0);
      expect(result.current.display.seconds).toBe(0);
    });

    it('handles milliseconds correctly', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 1500; // 1.5 seconds
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.display.seconds).toBe(1);
      expect(result.current.display.milliseconds).toBeGreaterThanOrEqual(0);
      expect(result.current.display.milliseconds).toBeLessThan(1000);
    });

    it('handles exactly 1 hour correctly', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 60 * 60 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.display.hours).toBe(1);
      expect(result.current.display.minutes).toBe(0);
      expect(result.current.display.seconds).toBe(0);
    });
  });

  describe('progress calculation', () => {
    it('returns 0 progress when 1 hour or more remaining', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 60 * 60 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.progress).toBe(0);
    });

    it('returns 0.5 progress when 30 minutes remaining', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 30 * 60 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.progress).toBeCloseTo(0.5, 1);
    });

    it('returns 1 progress when time has passed', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now - 5000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.progress).toBe(1);
    });

    it('clamps progress between 0 and 1', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // More than 1 hour remaining
      const target = now + 2 * 60 * 60 * 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.progress).toBeGreaterThanOrEqual(0);
      expect(result.current.progress).toBeLessThanOrEqual(1);
    });
  });

  describe('isPast flag', () => {
    it('returns false when time remains', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 60000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.isPast).toBe(false);
    });

    it('returns true when time has passed', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now - 1000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.isPast).toBe(true);
    });

    it('returns true when exactly at target time', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.isPast).toBe(true);
    });
  });

  describe('time updates', () => {
    it('updates over time', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      // Use 65 seconds so initial seconds is 5
      const target = now + 65000;
      const { result } = renderHook(() => useCountdown(target));

      const initialTimeRemaining = result.current.timeRemaining;
      expect(initialTimeRemaining).toBeCloseTo(65000, -2);

      act(() => {
        // Advance both system time and timers together
        vi.setSystemTime(now + 1000);
        vi.advanceTimersByTime(1000);
      });

      // Time remaining should have decreased
      expect(result.current.timeRemaining).toBeLessThan(initialTimeRemaining);
    });

    it('updates at 50ms intervals', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 60000;
      const { result } = renderHook(() => useCountdown(target));

      const initialTimeRemaining = result.current.timeRemaining;

      act(() => {
        // Advance both system time and timers together
        vi.setSystemTime(now + 50);
        vi.advanceTimersByTime(50);
      });

      // Time remaining should have changed
      expect(result.current.timeRemaining).toBeLessThan(initialTimeRemaining);
    });

    it('cleans up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 60000;
      const { unmount } = renderHook(() => useCountdown(target));

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('recalculates when target changes', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target1 = now + 60000; // 1 minute
      const target2 = now + 120000; // 2 minutes

      const { result, rerender } = renderHook(
        ({ target }) => useCountdown(target),
        { initialProps: { target: target1 } }
      );

      expect(result.current.display.minutes).toBe(1);
      expect(result.current.timeRemaining).toBeCloseTo(60000, -2);

      // Change target to 2 minutes
      rerender({ target: target2 });

      // After rerender, allow the new interval to run (need to advance past first tick)
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Time remaining should now reflect new target (about 2 minutes, minus ~100ms elapsed)
      // Using -3 precision to allow for ~1000ms tolerance
      expect(result.current.timeRemaining).toBeCloseTo(120000, -3);
    });
  });

  describe('timeRemaining', () => {
    it('returns positive value when time remains', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now + 60000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.timeRemaining).toBeGreaterThan(0);
    });

    it('returns negative value when time has passed', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const target = now - 5000;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.timeRemaining).toBeLessThan(0);
    });

    it('returns approximately correct remaining time', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const remaining = 30000;
      const target = now + remaining;
      const { result } = renderHook(() => useCountdown(target));

      expect(result.current.timeRemaining).toBeCloseTo(remaining, -2);
    });
  });
});
