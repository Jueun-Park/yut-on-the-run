import { describe, it, expect } from 'vitest';
import { BASIC_STICK, STICK_POOL, drawRandomStick } from '../sticks';

describe('Stick Content Module', () => {
  describe('BASIC_STICK', () => {
    it('should have all required properties', () => {
      expect(BASIC_STICK.id).toBe('basic');
      expect(BASIC_STICK.name).toBe('Basic Stick');
      expect(BASIC_STICK.description).toBeDefined();
      expect(BASIC_STICK.backProbability).toBe(0.5);
    });

    it('should have backProbability in valid range', () => {
      expect(BASIC_STICK.backProbability).toBeGreaterThanOrEqual(0);
      expect(BASIC_STICK.backProbability).toBeLessThanOrEqual(1);
    });
  });

  describe('STICK_POOL', () => {
    it('should contain exactly 10 sticks', () => {
      expect(STICK_POOL).toHaveLength(10);
    });

    it('should have all sticks with required properties', () => {
      STICK_POOL.forEach((stick) => {
        expect(stick.id).toBeDefined();
        expect(stick.name).toBeDefined();
        expect(stick.description).toBeDefined();
        expect(stick.backProbability).toBeDefined();
      });
    });

    it('should have all sticks with valid backProbability range', () => {
      STICK_POOL.forEach((stick) => {
        expect(stick.backProbability).toBeGreaterThanOrEqual(0);
        expect(stick.backProbability).toBeLessThanOrEqual(1);
      });
    });

    it('should have unique stick IDs', () => {
      const ids = STICK_POOL.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(STICK_POOL.length);
    });

    it('should have non-empty names and descriptions', () => {
      STICK_POOL.forEach((stick) => {
        expect(stick.name.length).toBeGreaterThan(0);
        expect(stick.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('drawRandomStick', () => {
    it('should return a stick from the pool', () => {
      const stick = drawRandomStick();
      expect(STICK_POOL).toContainEqual(stick);
    });

    it('should return sticks based on RNG function', () => {
      // Test with deterministic RNG
      const mockRng = () => 0; // Always return first stick
      const stick = drawRandomStick(mockRng);
      expect(stick).toEqual(STICK_POOL[0]);
    });

    it('should handle RNG at pool boundary', () => {
      // RNG returns value just below 1, should select last stick
      const mockRng = () => 0.999;
      const stick = drawRandomStick(mockRng);
      expect(STICK_POOL).toContainEqual(stick);
    });

    it('should allow duplicates (same stick can be drawn multiple times)', () => {
      // Draw with fixed RNG - should always return same stick
      const mockRng = () => 0.5;
      const stick1 = drawRandomStick(mockRng);
      const stick2 = drawRandomStick(mockRng);
      expect(stick1).toEqual(stick2);
    });

    it('should cover different sticks with varied RNG', () => {
      const drawnSticks = new Set();
      
      // Draw sticks with different RNG values
      for (let i = 0; i < STICK_POOL.length; i++) {
        const mockRng = () => i / STICK_POOL.length;
        const stick = drawRandomStick(mockRng);
        drawnSticks.add(stick.id);
      }

      // Should have drawn multiple different sticks
      expect(drawnSticks.size).toBeGreaterThan(1);
    });
  });
});
