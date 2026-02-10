/**
 * Reward System Module
 * 
 * Manages artifact rewards when pieces finish:
 * - Calculate reward candidates based on stack size
 *   - k=1 piece → 3 choices
 *   - k=2 pieces → 2 choices
 *   - k=3 pieces → 1 choice
 *   - k=4 pieces → 1 choice
 * - Generate artifact options (content TBD)
 * - Apply selected artifact
 * 
 * TODO: Implement reward candidate calculation
 * TODO: Define artifact interface (effects are content, not MVP priority)
 * TODO: Implement artifact selection logic
 * TODO: Hook to finish events
 */

export interface Artifact {
  id: string;
  name: string;
  description: string;
  // TODO: Add artifact effect properties
}

/**
 * Calculate number of artifact choices based on finishing stack size
 * Uses "stacking demerit" rule: max(1, 4 - k)
 */
export function calculateRewardChoices(stackSize: number): number {
  return Math.max(1, 4 - stackSize);
}

/**
 * Generate random artifact candidates
 * TODO: Implement artifact pool and RNG selection
 */
export function generateArtifactCandidates(count: number): Artifact[] {
  // TODO: Implement artifact generation
  console.log({ count }); // Placeholder
  throw new Error('Not implemented');
}

// TODO: Export artifact application logic
// TODO: Export artifact effect system (future)
