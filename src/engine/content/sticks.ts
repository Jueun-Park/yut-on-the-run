/**
 * Stick Content Module
 * 
 * Defines stick inventory items for the deck-building mechanic.
 * Sticks affect throw probabilities and outcomes.
 */

import type { RngFunction } from '../rng';

/**
 * Stick interface with id, name, description, and probability
 */
export interface Stick {
  id: string;
  name: string;
  description: string;
  backProbability: number; // Probability of landing Back (0.0 to 1.0)
}

/**
 * Basic/default stick used to fill 4 slots at game start
 */
export const BASIC_STICK: Stick = {
  id: 'basic',
  name: 'Basic Stick',
  description: 'A standard yut stick with balanced probabilities.',
  backProbability: 0.5,
};

/**
 * Pool of special sticks that can be offered at STICK nodes
 * Contains 10 sticks with varying probabilities and effects
 */
export const STICK_POOL: Stick[] = [
  {
    id: 'lucky-charm',
    name: 'Lucky Charm',
    description: '행운의 윷가락 - Slightly favors high rolls.',
    backProbability: 0.45,
  },
  {
    id: 'balanced-master',
    name: 'Balanced Master',
    description: '균형의 윷가락 - Perfectly balanced for consistent results.',
    backProbability: 0.5,
  },
  {
    id: 'moon-blessed',
    name: 'Moon-Blessed',
    description: '달의 축복 - Increases chance of MO (5 steps).',
    backProbability: 0.35,
  },
  {
    id: 'steady-walker',
    name: 'Steady Walker',
    description: '꾸준한 걸음 - Favors moderate rolls.',
    backProbability: 0.55,
  },
  {
    id: 'risky-gambler',
    name: 'Risky Gambler',
    description: '모험가의 윷가락 - High variance for bold players.',
    backProbability: 0.4,
  },
  {
    id: 'careful-step',
    name: 'Careful Step',
    description: '신중한 발걸음 - Favors shorter, safer moves.',
    backProbability: 0.6,
  },
  {
    id: 'wind-rider',
    name: 'Wind Rider',
    description: '바람타기 - Swift and unpredictable.',
    backProbability: 0.42,
  },
  {
    id: 'earth-bound',
    name: 'Earth-Bound',
    description: '대지의 윷가락 - Stable and grounded.',
    backProbability: 0.58,
  },
  {
    id: 'star-chaser',
    name: 'Star Chaser',
    description: '별을 쫓는 자 - Dreams of reaching the finish.',
    backProbability: 0.38,
  },
  {
    id: 'ancient-wisdom',
    name: 'Ancient Wisdom',
    description: '고대의 지혜 - A relic of past masters.',
    backProbability: 0.52,
  },
];

/**
 * Draw a random stick from the pool (allows duplicates)
 * @param rng Random number generator function (defaults to Math.random)
 * @returns A randomly selected stick from STICK_POOL
 */
export function drawRandomStick(rng: RngFunction = Math.random): Stick {
  const index = Math.floor(rng() * STICK_POOL.length);
  return STICK_POOL[index];
}
