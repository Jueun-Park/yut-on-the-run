import { describe, it, expect } from 'vitest';
import { throwYut, grantsBonus, YUT_PROBABILITY_TABLE } from '../index';

describe('RNG Module', () => {
  describe('YUT_PROBABILITY_TABLE', () => {
    it('should have correct probability distribution', () => {
      expect(YUT_PROBABILITY_TABLE).toHaveLength(5);

      const totalProbability = YUT_PROBABILITY_TABLE.reduce(
        (sum, entry) => sum + entry.probability,
        0
      );
      expect(totalProbability).toBeCloseTo(1.0, 5);
    });

    it('should have correct result mappings', () => {
      const table = YUT_PROBABILITY_TABLE;

      expect(table[0]).toEqual({ result: 'DO', steps: 1, probability: 0.20 });
      expect(table[1]).toEqual({ result: 'GAE', steps: 2, probability: 0.33 });
      expect(table[2]).toEqual({ result: 'GEOL', steps: 3, probability: 0.27 });
      expect(table[3]).toEqual({ result: 'YUT', steps: 4, probability: 0.13 });
      expect(table[4]).toEqual({ result: 'MO', steps: 5, probability: 0.07 });
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

    it('should produce results following approximate probability distribution', () => {
      const samples = 10000;
      const counts = {
        DO: 0,
        GAE: 0,
        GEOL: 0,
        YUT: 0,
        MO: 0,
      };

      for (let i = 0; i < samples; i++) {
        const result = throwYut();
        counts[result.result]++;
      }

      // Check if frequencies are roughly within expected ranges (with tolerance)
      // DO: 20% ± 3%
      expect(counts.DO / samples).toBeGreaterThan(0.17);
      expect(counts.DO / samples).toBeLessThan(0.23);

      // GAE: 33% ± 3%
      expect(counts.GAE / samples).toBeGreaterThan(0.30);
      expect(counts.GAE / samples).toBeLessThan(0.36);

      // GEOL: 27% ± 3%
      expect(counts.GEOL / samples).toBeGreaterThan(0.24);
      expect(counts.GEOL / samples).toBeLessThan(0.30);

      // YUT: 13% ± 3%
      expect(counts.YUT / samples).toBeGreaterThan(0.10);
      expect(counts.YUT / samples).toBeLessThan(0.16);

      // MO: 7% ± 3%
      expect(counts.MO / samples).toBeGreaterThan(0.04);
      expect(counts.MO / samples).toBeLessThan(0.10);
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
