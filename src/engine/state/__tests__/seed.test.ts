/**
 * Seed Normalization Tests
 */

import { describe, it, expect } from 'vitest';
import { generateRandomSeed, normalizeSeed } from '../seed';

describe('generateRandomSeed', () => {
  it('should generate a seed of default length 10', () => {
    const seed = generateRandomSeed();
    expect(seed).toHaveLength(10);
  });

  it('should generate a seed of specified length', () => {
    const seed = generateRandomSeed(5);
    expect(seed).toHaveLength(5);
  });

  it('should generate alphanumeric characters only', () => {
    const seed = generateRandomSeed(100);
    expect(seed).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should generate different seeds on consecutive calls', () => {
    const seed1 = generateRandomSeed();
    const seed2 = generateRandomSeed();
    expect(seed1).not.toBe(seed2);
  });
});

describe('normalizeSeed', () => {
  it('should trim whitespace from seed', () => {
    expect(normalizeSeed('  abc  ')).toBe('abc');
    expect(normalizeSeed('\tabc\n')).toBe('abc');
  });

  it('should return non-empty seed as-is after trimming', () => {
    expect(normalizeSeed('myseed')).toBe('myseed');
    expect(normalizeSeed('  myseed  ')).toBe('myseed');
  });

  it('should generate random seed if input is empty', () => {
    const seed = normalizeSeed('');
    expect(seed).toHaveLength(10);
    expect(seed).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should generate random seed if input is only whitespace', () => {
    const seed = normalizeSeed('   ');
    expect(seed).toHaveLength(10);
    expect(seed).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should generate random seed if input is tabs and newlines', () => {
    const seed = normalizeSeed('\t\n  \n\t');
    expect(seed).toHaveLength(10);
    expect(seed).toMatch(/^[A-Za-z0-9]+$/);
  });
});
