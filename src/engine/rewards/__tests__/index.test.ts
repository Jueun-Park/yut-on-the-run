import { describe, it, expect } from 'vitest';
import {
  calculateRewardChoices,
  generateArtifactCandidates,
} from '../index';

describe('Rewards Module', () => {
  describe('calculateRewardChoices - stacking demerit', () => {
    it('should return 3 choices for k=1 piece', () => {
      expect(calculateRewardChoices(1)).toBe(3);
    });

    it('should return 2 choices for k=2 pieces', () => {
      expect(calculateRewardChoices(2)).toBe(2);
    });

    it('should return 1 choice for k=3 pieces', () => {
      expect(calculateRewardChoices(3)).toBe(1);
    });

    it('should return 1 choice for k=4 pieces', () => {
      expect(calculateRewardChoices(4)).toBe(1);
    });

    it('should follow formula max(1, 4 - k)', () => {
      for (let k = 1; k <= 10; k++) {
        const expected = Math.max(1, 4 - k);
        expect(calculateRewardChoices(k)).toBe(expected);
      }
    });

    it('should never return less than 1 choice', () => {
      expect(calculateRewardChoices(5)).toBe(1);
      expect(calculateRewardChoices(10)).toBe(1);
      expect(calculateRewardChoices(100)).toBe(1);
    });
  });

  describe('generateArtifactCandidates', () => {
    it('should return empty array for count 0', () => {
      const candidates = generateArtifactCandidates(0);
      expect(candidates).toEqual([]);
    });

    it('should return specified number of artifacts', () => {
      const candidates = generateArtifactCandidates(3);
      expect(candidates).toHaveLength(3);
    });

    it('should return artifacts with required properties', () => {
      const candidates = generateArtifactCandidates(2);

      candidates.forEach((artifact) => {
        expect(artifact).toHaveProperty('id');
        expect(artifact).toHaveProperty('name');
        expect(artifact).toHaveProperty('description');
        expect(typeof artifact.id).toBe('string');
        expect(typeof artifact.name).toBe('string');
        expect(typeof artifact.description).toBe('string');
      });
    });

    it('should return unique artifacts', () => {
      const candidates = generateArtifactCandidates(5);
      const ids = candidates.map((a) => a.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should handle count larger than pool size', () => {
      // Artifact pool has 10 items
      const candidates = generateArtifactCandidates(20);

      expect(candidates.length).toBeLessThanOrEqual(10);
    });

    it('should return different artifacts on multiple calls (randomization)', () => {
      const candidates1 = generateArtifactCandidates(3);
      const candidates2 = generateArtifactCandidates(3);

      const ids1 = candidates1.map((a) => a.id).sort();
      const ids2 = candidates2.map((a) => a.id).sort();

      // With randomization, it's very unlikely to get the same 3 artifacts in the same order
      // We check if at least one is different (not a perfect test but reasonable)
      const allSame = ids1.every((id, i) => id === ids2[i]);

      // Run multiple times to increase confidence
      let foundDifference = !allSame;
      if (allSame) {
        for (let i = 0; i < 10 && !foundDifference; i++) {
          const testCandidates = generateArtifactCandidates(3);
          const testIds = testCandidates.map((a) => a.id).sort();
          foundDifference = !testIds.every((id, j) => id === ids1[j]);
        }
      }

      expect(foundDifference).toBe(true);
    });
  });
});
