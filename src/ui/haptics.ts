/**
 * Haptics Utility Module
 * 
 * Provides Web Vibration API wrapper with silent fallback.
 * No user-facing toggle setting - best-effort vibration on supported devices.
 */

/**
 * Check if vibration API is available
 */
export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Trigger a vibration pattern
 * @param pattern Single duration in ms or array of durations [vibrate, pause, vibrate, ...]
 * @returns true if vibration was triggered, false otherwise
 */
export function vibrate(pattern: number | number[]): boolean {
  if (!isVibrationSupported()) {
    return false;
  }

  try {
    return navigator.vibrate(pattern);
  } catch (error) {
    // Silently ignore errors
    console.debug('Vibration failed:', error);
    return false;
  }
}

/**
 * Cancel any ongoing vibration
 */
export function cancelVibration(): void {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate(0);
    } catch (error) {
      // Silently ignore errors
      console.debug('Cancel vibration failed:', error);
    }
  }
}

/**
 * Tick vibration pattern (for rolling state)
 * Short vibration every 500ms during rolling
 */
export function vibrateTick(): boolean {
  return vibrate(8); // 8ms vibration
}

/**
 * Commit confirmation vibration pattern
 * Single stronger vibration on commit
 */
export function vibrateCommit(): boolean {
  return vibrate(40); // 40ms vibration
}
