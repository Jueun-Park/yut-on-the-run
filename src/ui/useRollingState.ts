/**
 * Rolling State Machine Hook
 * 
 * Implements the throw button rolling state machine with:
 * - Minimum rolling duration: 0.5s
 * - Maximum rolling duration: 3.0s
 * - Pointer event handling (down/up/leave/cancel)
 * - Haptics integration (tick every 500ms, commit once)
 * - RNG consumed exactly once per commit
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { vibrateTick, vibrateCommit, cancelVibration } from './haptics';

export interface UseRollingStateOptions {
  onCommit: () => void;
}

export interface UseRollingStateReturn {
  isRolling: boolean;
  handlePointerDown: () => void;
  handlePointerUp: () => void;
  handlePointerLeave: () => void;
  handlePointerCancel: () => void;
}

const MIN_ROLLING_DURATION = 500; // 0.5s
const MAX_ROLLING_DURATION = 3000; // 3.0s
const TICK_INTERVAL = 500; // 500ms tick interval

/**
 * Custom hook for managing throw button rolling state
 */
export function useRollingState({ onCommit }: UseRollingStateOptions): UseRollingStateReturn {
  const [isRolling, setIsRolling] = useState(false);
  
  // Track if we've already committed to prevent double-commit
  const hasCommittedRef = useRef(false);
  
  // Track rolling start time
  const rollingStartTimeRef = useRef<number | null>(null);
  
  // Timer references for cleanup
  const minTimerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<number | null>(null);

  /**
   * Commit the throw (call RNG and update state)
   * Ensures RNG is consumed exactly once
   */
  const commit = useCallback(() => {
    // Prevent double-commit
    if (hasCommittedRef.current) {
      return;
    }
    
    hasCommittedRef.current = true;
    setIsRolling(false);
    
    // Clear all timers
    if (minTimerRef.current !== null) {
      clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }
    if (maxTimerRef.current !== null) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    
    // Stop any ongoing vibration and trigger commit vibration
    cancelVibration();
    vibrateCommit();
    
    // Call the commit callback (this will consume RNG)
    onCommit();
  }, [onCommit]);

  /**
   * Handle pointer down - enter rolling state
   */
  const handlePointerDown = useCallback(() => {
    // Reset state
    hasCommittedRef.current = false;
    rollingStartTimeRef.current = Date.now();
    setIsRolling(true);

    // Start tick vibration immediately and then every 500ms
    vibrateTick();
    tickIntervalRef.current = window.setInterval(() => {
      vibrateTick();
    }, TICK_INTERVAL);

    // Set minimum timer (0.5s)
    minTimerRef.current = window.setTimeout(() => {
      minTimerRef.current = null;
    }, MIN_ROLLING_DURATION);

    // Set maximum timer (3.0s) - auto-commit
    maxTimerRef.current = window.setTimeout(() => {
      commit();
    }, MAX_ROLLING_DURATION);
  }, [commit]);

  /**
   * Handle pointer release (up/leave/cancel)
   * If before min duration, keep rolling until min duration
   * If after min duration but before max, commit immediately
   */
  const handlePointerRelease = useCallback(() => {
    if (!isRolling || hasCommittedRef.current) {
      return;
    }

    const elapsed = Date.now() - (rollingStartTimeRef.current || 0);

    if (elapsed < MIN_ROLLING_DURATION) {
      // Released before min duration - keep rolling, will auto-commit at min duration
      // The minTimer is already cleared, so we need to wait for the remaining time
      const remainingTime = MIN_ROLLING_DURATION - elapsed;
      if (minTimerRef.current !== null) {
        clearTimeout(minTimerRef.current);
      }
      minTimerRef.current = window.setTimeout(() => {
        commit();
      }, remainingTime);
    } else {
      // Released after min duration - commit immediately
      commit();
    }
  }, [isRolling, commit]);

  const handlePointerUp = handlePointerRelease;
  const handlePointerLeave = handlePointerRelease;
  const handlePointerCancel = handlePointerRelease;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (minTimerRef.current !== null) {
        clearTimeout(minTimerRef.current);
      }
      if (maxTimerRef.current !== null) {
        clearTimeout(maxTimerRef.current);
      }
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
      }
      cancelVibration();
    };
  }, []);

  return {
    isRolling,
    handlePointerDown,
    handlePointerUp,
    handlePointerLeave,
    handlePointerCancel,
  };
}
