/**
 * Game Reducer Tests
 */

import { describe, it, expect } from 'vitest';
import { gameReducer } from '../reducer';
import { initializeGameState, GamePhase } from '../index';

describe('gameReducer', () => {
  describe('NEW_GAME', () => {
    it('should initialize a new game with default seed', () => {
      const state = initializeGameState('test-seed');
      const newState = gameReducer(state, { type: 'NEW_GAME' });
      
      expect(newState.turn).toBe(1);
      expect(newState.phase).toBe(GamePhase.THROW);
      expect(newState.throwsRemaining).toBe(1);
      expect(newState.hand).toEqual([]);
      expect(newState.seed).toHaveLength(10); // Random seed
    });

    it('should initialize a new game with provided seed', () => {
      const state = initializeGameState('old-seed');
      const newState = gameReducer(state, { type: 'NEW_GAME', seed: 'new-seed' });
      
      expect(newState.seed).toBe('new-seed');
      expect(newState.turn).toBe(1);
    });

    it('should normalize empty seed to random seed', () => {
      const state = initializeGameState('old-seed');
      const newState = gameReducer(state, { type: 'NEW_GAME', seed: '   ' });
      
      expect(newState.seed).toHaveLength(10);
      expect(newState.seed).not.toBe('   ');
    });
  });

  describe('SET_PHASE', () => {
    it('should update phase', () => {
      const state = initializeGameState();
      const newState = gameReducer(state, { type: 'SET_PHASE', phase: GamePhase.PLAY });
      
      expect(newState.phase).toBe(GamePhase.PLAY);
    });
  });

  describe('INCREMENT_TURN', () => {
    it('should increment turn counter', () => {
      const state = initializeGameState();
      const newState = gameReducer(state, { type: 'INCREMENT_TURN' });
      
      expect(newState.turn).toBe(2);
    });
  });

  describe('END_TURN', () => {
    it('should reset to THROW phase and increment turn', () => {
      const state = {
        ...initializeGameState(),
        phase: GamePhase.PLAY,
        turn: 1,
        hand: [{ result: 'DO' as const, steps: 1 }],
        throwsRemaining: 0,
        selectedNodeId: 'O5' as const,
        selectedTokenIndex: 0,
      };
      
      const newState = gameReducer(state, { type: 'END_TURN' });
      
      expect(newState.phase).toBe(GamePhase.THROW);
      expect(newState.turn).toBe(2);
      expect(newState.throwsRemaining).toBe(1);
      expect(newState.hand).toEqual([]);
      expect(newState.selectedNodeId).toBeUndefined();
      expect(newState.selectedTokenIndex).toBeUndefined();
    });
  });

  describe('SET_SELECTED_NODE', () => {
    it('should set selected node ID', () => {
      const state = initializeGameState();
      const newState = gameReducer(state, { type: 'SET_SELECTED_NODE', nodeId: 'O5' });
      
      expect(newState.selectedNodeId).toBe('O5');
    });

    it('should clear selected node when undefined', () => {
      const state = { ...initializeGameState(), selectedNodeId: 'O5' as const };
      const newState = gameReducer(state, { type: 'SET_SELECTED_NODE', nodeId: undefined });
      
      expect(newState.selectedNodeId).toBeUndefined();
    });
  });

  describe('SET_SELECTED_TOKEN', () => {
    it('should set selected token index', () => {
      const state = initializeGameState();
      const newState = gameReducer(state, { type: 'SET_SELECTED_TOKEN', tokenIndex: 2 });
      
      expect(newState.selectedTokenIndex).toBe(2);
    });

    it('should clear selected token when undefined', () => {
      const state = { ...initializeGameState(), selectedTokenIndex: 1 };
      const newState = gameReducer(state, { type: 'SET_SELECTED_TOKEN', tokenIndex: undefined });
      
      expect(newState.selectedTokenIndex).toBeUndefined();
    });
  });

  describe('ADD_HAND_TOKEN', () => {
    it('should add token to hand', () => {
      const state = initializeGameState();
      const token = { result: 'DO' as const, steps: 1 };
      const newState = gameReducer(state, { type: 'ADD_HAND_TOKEN', token });
      
      expect(newState.hand).toHaveLength(1);
      expect(newState.hand[0]).toEqual(token);
    });

    it('should append token to existing hand', () => {
      const state = {
        ...initializeGameState(),
        hand: [{ result: 'GAE' as const, steps: 2 }],
      };
      const token = { result: 'DO' as const, steps: 1 };
      const newState = gameReducer(state, { type: 'ADD_HAND_TOKEN', token });
      
      expect(newState.hand).toHaveLength(2);
      expect(newState.hand[1]).toEqual(token);
    });
  });

  describe('REMOVE_HAND_TOKEN', () => {
    it('should remove token at specified index', () => {
      const state = {
        ...initializeGameState(),
        hand: [
          { result: 'DO' as const, steps: 1 },
          { result: 'GAE' as const, steps: 2 },
          { result: 'GEOL' as const, steps: 3 },
        ],
      };
      
      const newState = gameReducer(state, { type: 'REMOVE_HAND_TOKEN', index: 1 });
      
      expect(newState.hand).toHaveLength(2);
      expect(newState.hand[0]).toEqual({ result: 'DO', steps: 1 });
      expect(newState.hand[1]).toEqual({ result: 'GEOL', steps: 3 });
    });
  });

  describe('SET_THROWS_REMAINING', () => {
    it('should set throws remaining count', () => {
      const state = initializeGameState();
      const newState = gameReducer(state, { type: 'SET_THROWS_REMAINING', count: 3 });
      
      expect(newState.throwsRemaining).toBe(3);
    });
  });

  describe('DECREMENT_THROWS_REMAINING', () => {
    it('should decrement throws remaining', () => {
      const state = { ...initializeGameState(), throwsRemaining: 2 };
      const newState = gameReducer(state, { type: 'DECREMENT_THROWS_REMAINING' });
      
      expect(newState.throwsRemaining).toBe(1);
    });

    it('should not go below zero', () => {
      const state = { ...initializeGameState(), throwsRemaining: 0 };
      const newState = gameReducer(state, { type: 'DECREMENT_THROWS_REMAINING' });
      
      expect(newState.throwsRemaining).toBe(0);
    });
  });
});
