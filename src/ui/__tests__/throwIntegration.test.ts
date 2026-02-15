/**
 * Integration test for throw button with RNG and state updates
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { gameReducer } from '@/engine/state/reducer';
import { initializeGameState } from '@/engine/state';
import { throwYut, grantsBonus } from '@/engine/rng';

describe('Throw button integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should handle a complete throw flow with normal result', () => {
    let state = initializeGameState('test-seed');
    
    // Initial state
    expect(state.throwsRemaining).toBe(1);
    expect(state.hand).toHaveLength(0);

    // Simulate throw commit
    const result = throwYut(state.stickInventory);
    state = gameReducer(state, { type: 'ADD_HAND_TOKEN', token: result });
    state = gameReducer(state, { type: 'DECREMENT_THROWS_REMAINING' });

    // Should have added token and decremented throws
    expect(state.hand).toHaveLength(1);
    expect(state.hand[0]).toEqual(result);
    
    // If not YUT/MO, throwsRemaining should be 0
    if (!grantsBonus(result.result)) {
      expect(state.throwsRemaining).toBe(0);
    } else {
      // If YUT/MO, we need to increment
      state = gameReducer(state, { type: 'INCREMENT_THROWS_REMAINING' });
      expect(state.throwsRemaining).toBe(1);
    }
  });

  it('should handle YUT/MO bonus throw correctly', () => {
    let state = initializeGameState('test-seed');
    
    // Simulate YUT result (backCount = 4)
    const yutResult = { result: 'YUT' as const, steps: 4 };
    
    state = gameReducer(state, { type: 'ADD_HAND_TOKEN', token: yutResult });
    state = gameReducer(state, { type: 'DECREMENT_THROWS_REMAINING' });
    
    expect(state.throwsRemaining).toBe(0);
    
    // Apply bonus
    if (grantsBonus(yutResult.result)) {
      state = gameReducer(state, { type: 'INCREMENT_THROWS_REMAINING' });
    }
    
    // Should have 1 throw remaining (bonus)
    expect(state.throwsRemaining).toBe(1);
    expect(state.hand).toHaveLength(1);
  });

  it('should handle MO bonus throw correctly', () => {
    let state = initializeGameState('test-seed');
    
    // Simulate MO result (backCount = 0)
    const moResult = { result: 'MO' as const, steps: 5 };
    
    state = gameReducer(state, { type: 'ADD_HAND_TOKEN', token: moResult });
    state = gameReducer(state, { type: 'DECREMENT_THROWS_REMAINING' });
    
    expect(state.throwsRemaining).toBe(0);
    
    // Apply bonus
    if (grantsBonus(moResult.result)) {
      state = gameReducer(state, { type: 'INCREMENT_THROWS_REMAINING' });
    }
    
    // Should have 1 throw remaining (bonus)
    expect(state.throwsRemaining).toBe(1);
    expect(state.hand).toHaveLength(1);
  });

  it('should accumulate multiple throws in hand', () => {
    let state = initializeGameState('test-seed');
    
    // First throw
    const result1 = { result: 'DO' as const, steps: 1 };
    state = gameReducer(state, { type: 'ADD_HAND_TOKEN', token: result1 });
    state = gameReducer(state, { type: 'DECREMENT_THROWS_REMAINING' });
    
    expect(state.hand).toHaveLength(1);
    expect(state.throwsRemaining).toBe(0);
    
    // Manually add another throw (simulating bonus)
    state = gameReducer(state, { type: 'INCREMENT_THROWS_REMAINING' });
    
    const result2 = { result: 'GAE' as const, steps: 2 };
    state = gameReducer(state, { type: 'ADD_HAND_TOKEN', token: result2 });
    state = gameReducer(state, { type: 'DECREMENT_THROWS_REMAINING' });
    
    expect(state.hand).toHaveLength(2);
    expect(state.hand[0]).toEqual(result1);
    expect(state.hand[1]).toEqual(result2);
  });

  it('should verify RNG is consumed exactly once per throw', () => {
    const state = initializeGameState('test-seed');
    
    // Create a mock RNG that tracks calls
    let callCount = 0;
    const mockRng = () => {
      callCount++;
      return 0.3; // Will result in Back (0.3 < 0.5), all 4 backs = YUT
    };
    
    // Throw with mock RNG
    const result = throwYut(state.stickInventory, mockRng);
    
    // Should have called RNG exactly 4 times (once per stick)
    expect(callCount).toBe(4);
    expect(result.result).toBe('YUT'); // backCount = 4
    expect(result.steps).toBe(4);
  });
});
