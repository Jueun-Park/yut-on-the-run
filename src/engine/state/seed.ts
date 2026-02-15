/**
 * Seed Normalization Utilities
 * 
 * Handles seed normalization and random seed generation for game state.
 */

/**
 * Generate a random alphanumeric seed string
 * @param length Maximum length of the seed (default: 10)
 * @returns Random seed string
 */
export function generateRandomSeed(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Normalize a seed string by trimming whitespace
 * If the trimmed seed is empty, generate a random seed
 * @param seed Input seed string (may be empty or whitespace)
 * @returns Normalized seed string
 */
export function normalizeSeed(seed: string): string {
  const trimmed = seed.trim();
  return trimmed.length > 0 ? trimmed : generateRandomSeed(10);
}
