/**
 * Tests for rolling state machine logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRollingState } from '../useRollingState';

// Mock haptics functions
vi.mock('../haptics', () => ({
  vibrateTick: vi.fn(() => true),
  vibrateCommit: vi.fn(() => true),
  cancelVibration: vi.fn(),
}));

describe('useRollingState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should start rolling on pointer down', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    expect(result.current.isRolling).toBe(false);

    act(() => {
      result.current.handlePointerDown();
    });

    expect(result.current.isRolling).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should commit at 0.5s if released before 0.5s', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    // Start rolling
    act(() => {
      result.current.handlePointerDown();
    });

    // Release after 200ms (before min duration)
    act(() => {
      vi.advanceTimersByTime(200);
      result.current.handlePointerUp();
    });

    // Should not commit yet
    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.isRolling).toBe(true);

    // Advance to 500ms total (min duration)
    act(() => {
      vi.advanceTimersByTime(300); // 200 + 300 = 500
    });

    // Should commit now
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(result.current.isRolling).toBe(false);
  });

  it('should commit immediately if released between 0.5s and 3.0s', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    // Start rolling
    act(() => {
      result.current.handlePointerDown();
    });

    // Release after 1000ms (between min and max)
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handlePointerUp();
    });

    // Should commit immediately
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(result.current.isRolling).toBe(false);
  });

  it('should auto-commit at 3.0s if still held', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    // Start rolling
    act(() => {
      result.current.handlePointerDown();
    });

    // Don't release, just advance time to max duration
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should auto-commit
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(result.current.isRolling).toBe(false);
  });

  it('should not commit twice (double-commit prevention)', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    // Start rolling
    act(() => {
      result.current.handlePointerDown();
    });

    // Release after 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handlePointerUp();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);

    // Try to release again (shouldn't commit again)
    act(() => {
      result.current.handlePointerUp();
    });

    expect(onCommit).toHaveBeenCalledTimes(1); // Still only 1
  });

  it('should handle pointerLeave the same as pointerUp', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    act(() => {
      result.current.handlePointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handlePointerLeave();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(result.current.isRolling).toBe(false);
  });

  it('should handle pointerCancel the same as pointerUp', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    act(() => {
      result.current.handlePointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.handlePointerCancel();
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(result.current.isRolling).toBe(false);
  });

  it('should cleanup timers on unmount', () => {
    const onCommit = vi.fn();
    const { result, unmount } = renderHook(() => useRollingState({ onCommit }));

    act(() => {
      result.current.handlePointerDown();
    });

    // Unmount while rolling
    unmount();

    // Advance timers - should not commit after unmount
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should not commit if pointerUp called before pointerDown', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    // Call pointerUp without pointerDown
    act(() => {
      result.current.handlePointerUp();
    });

    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.isRolling).toBe(false);
  });

  it('should handle rapid press and release correctly', () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useRollingState({ onCommit }));

    // Press
    act(() => {
      result.current.handlePointerDown();
    });

    // Immediate release (0ms)
    act(() => {
      result.current.handlePointerUp();
    });

    // Should still wait for min duration
    expect(onCommit).not.toHaveBeenCalled();

    // Advance to min duration
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
