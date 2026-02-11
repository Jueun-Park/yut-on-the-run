import { describe, it, expect } from 'vitest';
import {
  throwYut,
  grantsBonus,
  sampleStick,
  sample4Sticks,
  mapBackCountToResult,
} from '../index';
import { BASIC_STICK, type Stick } from '../../content/sticks';

describe('RNG Module - 4-Stick Sampling', () => {
  describe('BASIC_STICK', () => {
    it('should have 50% back probability', () => {
      expect(BASIC_STICK.backProbability).toBe(0.5);
    });
  });

  describe('sampleStick', () => {
    it('should return Back when rng returns below backProbability', () => {
      const stick: Stick = { id: 'test', name: 'Test', backProbability: 0.7 };
      const result = sampleStick(stick, () => 0.5); // 0.5 < 0.7
      expect(result).toBe('Back');
    });

    it('should return Front when rng returns at or above backProbability', () => {
      const stick: Stick = { id: 'test', name: 'Test', backProbability: 0.3 };
      const result = sampleStick(stick, () => 0.5); // 0.5 >= 0.3
      expect(result).toBe('Front');
    });

    it('should return Front for backProbability 0', () => {
      const stick: Stick = { id: 'test', name: 'Test', backProbability: 0 };
      const result = sampleStick(stick, () => 0.5);
      expect(result).toBe('Front');
    });

    it('should return Back for backProbability 1', () => {
      const stick: Stick = { id: 'test', name: 'Test', backProbability: 1 };
      const result = sampleStick(stick, () => 0.5);
      expect(result).toBe('Back');
    });
  });

  describe('sample4Sticks', () => {
    it('should throw error if not exactly 4 sticks', () => {
      expect(() => sample4Sticks([])).toThrow('Must provide exactly 4 sticks');
      expect(() => sample4Sticks([BASIC_STICK])).toThrow(
        'Must provide exactly 4 sticks'
      );
      expect(() =>
        sample4Sticks([BASIC_STICK, BASIC_STICK, BASIC_STICK])
      ).toThrow('Must provide exactly 4 sticks');
    });

    it('should return 0 when all sticks land Front', () => {
      const sticks = [BASIC_STICK, BASIC_STICK, BASIC_STICK, BASIC_STICK];
      // rng always returns 1.0, which is >= backProbability (0.5), so all Front
      const backCount = sample4Sticks(sticks, () => 1.0);
      expect(backCount).toBe(0);
    });

    it('should return 4 when all sticks land Back', () => {
      const sticks = [BASIC_STICK, BASIC_STICK, BASIC_STICK, BASIC_STICK];
      // rng always returns 0.0, which is < backProbability (0.5), so all Back
      const backCount = sample4Sticks(sticks, () => 0.0);
      expect(backCount).toBe(4);
    });

    it('should count back results correctly with mixed results', () => {
      const sticks = [BASIC_STICK, BASIC_STICK, BASIC_STICK, BASIC_STICK];
      // Return sequence: [0.0, 0.6, 0.3, 0.7]
      // With backProbability=0.5: [Back, Front, Back, Front] = 2 backs
      let callCount = 0;
      const sequence = [0.0, 0.6, 0.3, 0.7];
      const mockRng = () => sequence[callCount++];

      const backCount = sample4Sticks(sticks, mockRng);
      expect(backCount).toBe(2);
      expect(callCount).toBe(4); // Verify 4 independent samples
    });

    it('should sample each stick independently', () => {
      const sticks = [BASIC_STICK, BASIC_STICK, BASIC_STICK, BASIC_STICK];
      // Create controlled sequence to verify independence
      let callCount = 0;
      const sequence = [0.2, 0.8, 0.1, 0.9]; // Back, Front, Back, Front
      const mockRng = () => sequence[callCount++];

      const backCount = sample4Sticks(sticks, mockRng);
      expect(backCount).toBe(2);
      expect(callCount).toBe(4); // Must call rng exactly 4 times
    });
  });

  describe('mapBackCountToResult', () => {
    it('should map backCount=0 to MO (5 steps)', () => {
      const result = mapBackCountToResult(0);
      expect(result).toEqual({ result: 'MO', steps: 5 });
    });

    it('should map backCount=1 to DO (1 step)', () => {
      const result = mapBackCountToResult(1);
      expect(result).toEqual({ result: 'DO', steps: 1 });
    });

    it('should map backCount=2 to GAE (2 steps)', () => {
      const result = mapBackCountToResult(2);
      expect(result).toEqual({ result: 'GAE', steps: 2 });
    });

    it('should map backCount=3 to GEOL (3 steps)', () => {
      const result = mapBackCountToResult(3);
      expect(result).toEqual({ result: 'GEOL', steps: 3 });
    });

    it('should map backCount=4 to YUT (4 steps)', () => {
      const result = mapBackCountToResult(4);
      expect(result).toEqual({ result: 'YUT', steps: 4 });
    });

    it('should throw error for invalid backCount', () => {
      expect(() => mapBackCountToResult(-1)).toThrow('Invalid backCount');
      expect(() => mapBackCountToResult(5)).toThrow('Invalid backCount');
    });
  });

  describe('throwYut', () => {
    it('should return a valid HandToken', () => {
      const result = throwYut();

      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('steps');
      expect(['DO', 'GAE', 'GEOL', 'YUT', 'MO']).toContain(result.result);
      expect(result.steps).toBeGreaterThanOrEqual(1);
      expect(result.steps).toBeLessThanOrEqual(5);
    });

    it('should return consistent steps for each result', () => {
      const results = new Set<string>();

      // Run multiple times to get variety
      for (let i = 0; i < 100; i++) {
        const token = throwYut();
        results.add(`${token.result}:${token.steps}`);

        // Verify step mapping
        switch (token.result) {
          case 'DO':
            expect(token.steps).toBe(1);
            break;
          case 'GAE':
            expect(token.steps).toBe(2);
            break;
          case 'GEOL':
            expect(token.steps).toBe(3);
            break;
          case 'YUT':
            expect(token.steps).toBe(4);
            break;
          case 'MO':
            expect(token.steps).toBe(5);
            break;
        }
      }

      // Should have gotten at least some variety
      expect(results.size).toBeGreaterThan(1);
    });

    it('should use default 4 sticks when not provided', () => {
      // Test that throwYut() works without explicit sticks argument
      const result = throwYut();
      expect(['DO', 'GAE', 'GEOL', 'YUT', 'MO']).toContain(result.result);
    });

    it('should be deterministic with controlled RNG', () => {
      const sticks = [BASIC_STICK, BASIC_STICK, BASIC_STICK, BASIC_STICK];
      
      // All backs (backCount=4) → YUT
      const result1 = throwYut(sticks, () => 0.0);
      expect(result1).toEqual({ result: 'YUT', steps: 4 });

      // All fronts (backCount=0) → MO
      const result2 = throwYut(sticks, () => 1.0);
      expect(result2).toEqual({ result: 'MO', steps: 5 });

      // 1 back (first stick back, rest front) → DO
      let count = 0;
      const result3 = throwYut(sticks, () => (count++ === 0 ? 0.0 : 1.0));
      expect(result3).toEqual({ result: 'DO', steps: 1 });
    });

    it('should sample 4 independent sticks per throw', () => {
      const sticks = [BASIC_STICK, BASIC_STICK, BASIC_STICK, BASIC_STICK];
      let callCount = 0;
      const mockRng = () => {
        callCount++;
        return Math.random();
      };

      throwYut(sticks, mockRng);
      expect(callCount).toBe(4); // Must call rng exactly 4 times per throw
    });

    it('should produce binomial distribution with default sticks', () => {
      // With 4 sticks at 50% back probability, outcomes follow binomial distribution
      // Expected probabilities: P(k backs) = C(4,k) * 0.5^4
      // backCount=0: 1/16 = 6.25%
      // backCount=1: 4/16 = 25%
      // backCount=2: 6/16 = 37.5%
      // backCount=3: 4/16 = 25%
      // backCount=4: 1/16 = 6.25%
      const samples = 10000;
      const counts = {
        MO: 0,   // backCount=0
        DO: 0,   // backCount=1
        GAE: 0,  // backCount=2
        GEOL: 0, // backCount=3
        YUT: 0,  // backCount=4
      };

      for (let i = 0; i < samples; i++) {
        const result = throwYut();
        counts[result.result]++;
      }

      // Check approximate binomial distribution (with generous tolerance)
      expect(counts.MO / samples).toBeGreaterThan(0.04);   // ~6.25%
      expect(counts.MO / samples).toBeLessThan(0.09);

      expect(counts.DO / samples).toBeGreaterThan(0.22);   // ~25%
      expect(counts.DO / samples).toBeLessThan(0.28);

      expect(counts.GAE / samples).toBeGreaterThan(0.34);  // ~37.5%
      expect(counts.GAE / samples).toBeLessThan(0.41);

      expect(counts.GEOL / samples).toBeGreaterThan(0.22); // ~25%
      expect(counts.GEOL / samples).toBeLessThan(0.28);

      expect(counts.YUT / samples).toBeGreaterThan(0.04);  // ~6.25%
      expect(counts.YUT / samples).toBeLessThan(0.09);
    });
  });

  describe('grantsBonus', () => {
    it('should grant bonus for YUT', () => {
      expect(grantsBonus('YUT')).toBe(true);
    });

    it('should grant bonus for MO', () => {
      expect(grantsBonus('MO')).toBe(true);
    });

    it('should NOT grant bonus for DO', () => {
      expect(grantsBonus('DO')).toBe(false);
    });

    it('should NOT grant bonus for GAE', () => {
      expect(grantsBonus('GAE')).toBe(false);
    });

    it('should NOT grant bonus for GEOL', () => {
      expect(grantsBonus('GEOL')).toBe(false);
    });
  });
});
