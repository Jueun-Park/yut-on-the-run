/**
 * Seeded Random Number Generator
 * 
 * Implements a deterministic PRNG (Mulberry32) for reproducible gameplay.
 * Same seed + same sequence of calls = same random numbers.
 * 
 * Usage:
 * - Create instance with seed string
 * - Call next() to get random number in [0, 1)
 * - Seed is normalized with trim(); empty trimmed seed generates random seed
 */

/**
 * Hash a string to a 32-bit unsigned integer seed
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a random seed string (6 alphanumeric characters)
 */
function generateRandomSeed(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  for (let i = 0; i < 6; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)];
  }
  return seed;
}

/**
 * Normalize seed: trim, and if empty generate random
 */
export function normalizeSeed(seed: string): string {
  const trimmed = seed.trim();
  return trimmed.length > 0 ? trimmed : generateRandomSeed();
}

/**
 * Seeded random number generator using Mulberry32 algorithm
 */
export class SeededRandom {
  private state: number;
  public readonly seed: string;

  /**
   * Create a new seeded RNG
   * @param seed String seed (will be normalized with trim() and hashed)
   */
  constructor(seed: string) {
    this.seed = normalizeSeed(seed);
    this.state = hashString(this.seed);
  }

  /**
   * Get next random number in [0, 1)
   */
  next(): number {
    // Mulberry32 algorithm
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Get the actual seed being used (after normalization)
   */
  getSeed(): string {
    return this.seed;
  }
}
