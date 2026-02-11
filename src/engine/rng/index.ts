/**
 * RNG with 4-Stick Sampling Model
 * 
 * Implements yut throw mechanics using 4 independent stick throws:
 * - Each stick can land Front or Back
 * - backCount = number of Back results (0..4)
 * - Outcome mapping:
 *   - backCount=1 → 도(DO, 1 step)
 *   - backCount=2 → 개(GAE, 2 steps)
 *   - backCount=3 → 걸(GEOL, 3 steps)
 *   - backCount=4 → 윷(YUT, 4 steps)
 *   - backCount=0 → 모(MO, 5 steps)
 * 
 * Bonus throw logic: YUT/MO → +1 throw
 */

import type { YutResult, HandToken } from '../state';

/**
 * Stick face result
 */
export type StickFace = 'Front' | 'Back';

/**
 * Stick configuration with Front/Back probabilities
 */
export interface Stick {
  id: string;
  name: string;
  backProbability: number; // Probability of landing Back (0.0 to 1.0)
}

/**
 * RNG function type for dependency injection (testability)
 * Returns a random number in [0, 1)
 */
export type RngFunction = () => number;

/**
 * Default stick configuration (MVP: all sticks identical with 50% back probability)
 */
export const DEFAULT_STICK: Stick = {
  id: 'basic',
  name: 'Basic Stick',
  backProbability: 0.5,
};

/**
 * Sample a single stick's throw (Front or Back)
 */
export function sampleStick(stick: Stick, rng: RngFunction = Math.random): StickFace {
  return rng() < stick.backProbability ? 'Back' : 'Front';
}

/**
 * Sample 4 sticks and calculate backCount
 */
export function sample4Sticks(sticks: Stick[], rng: RngFunction = Math.random): number {
  if (sticks.length !== 4) {
    throw new Error('Must provide exactly 4 sticks');
  }

  let backCount = 0;
  for (const stick of sticks) {
    if (sampleStick(stick, rng) === 'Back') {
      backCount++;
    }
  }

  return backCount;
}

/**
 * Map backCount (0..4) to yut result and steps
 */
export function mapBackCountToResult(backCount: number): HandToken {
  switch (backCount) {
    case 0:
      return { result: 'MO', steps: 5 };
    case 1:
      return { result: 'DO', steps: 1 };
    case 2:
      return { result: 'GAE', steps: 2 };
    case 3:
      return { result: 'GEOL', steps: 3 };
    case 4:
      return { result: 'YUT', steps: 4 };
    default:
      throw new Error(`Invalid backCount: ${backCount}`);
  }
}

/**
 * Throws yut sticks using 4-stick sampling model
 * @param sticks Array of 4 sticks to throw (defaults to 4 basic sticks)
 * @param rng Random number generator function (defaults to Math.random)
 */
export function throwYut(
  sticks: Stick[] = [DEFAULT_STICK, DEFAULT_STICK, DEFAULT_STICK, DEFAULT_STICK],
  rng: RngFunction = Math.random
): HandToken {
  const backCount = sample4Sticks(sticks, rng);
  return mapBackCountToResult(backCount);
}

/**
 * Checks if the result grants a bonus throw
 */
export function grantsBonus(result: YutResult): boolean {
  return result === 'YUT' || result === 'MO';
}

// TODO: Export additional RNG utilities as needed
