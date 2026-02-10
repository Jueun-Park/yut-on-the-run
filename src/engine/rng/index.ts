/**
 * RNG with Weighted Probability Table
 * 
 * Implements yut throw mechanics with fixed probability:
 * - 도(DO, 1 step): 20%
 * - 개(GAE, 2 steps): 33%
 * - 걸(GEOL, 3 steps): 27%
 * - 윷(YUT, 4 steps): 13%
 * - 모(MO, 5 steps): 7%
 * 
 * TODO: Implement probability table and cumulative sampling
 * TODO: Implement throw bonus logic (윷/모 → +1 throw)
 * TODO: (Future) Add seed-based RNG for reproducibility
 */

import type { YutResult, HandToken } from '../state';

export interface YutProbability {
  result: YutResult;
  steps: number;
  probability: number;
}

// Fixed probability table (MVP approximation)
export const YUT_PROBABILITY_TABLE: YutProbability[] = [
  { result: 'DO', steps: 1, probability: 0.20 },
  { result: 'GAE', steps: 2, probability: 0.33 },
  { result: 'GEOL', steps: 3, probability: 0.27 },
  { result: 'YUT', steps: 4, probability: 0.13 },
  { result: 'MO', steps: 5, probability: 0.07 },
];

/**
 * Throws yut sticks and returns the result
 * TODO: Implement cumulative probability sampling
 */
export function throwYut(): HandToken {
  // TODO: Implement RNG logic
  // Generate random float [0, 1)
  // Map to cumulative probability ranges
  // Return corresponding result
  throw new Error('Not implemented');
}

/**
 * Checks if the result grants a bonus throw
 */
export function grantsBonus(result: YutResult): boolean {
  return result === 'YUT' || result === 'MO';
}

// TODO: Export additional RNG utilities as needed
