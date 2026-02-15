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

  describe('INCREMENT_THROWS_REMAINING', () => {
    it('should increment throws remaining', () => {
      const state = { ...initializeGameState(), throwsRemaining: 1 };
      const newState = gameReducer(state, { type: 'INCREMENT_THROWS_REMAINING' });
      
      expect(newState.throwsRemaining).toBe(2);
    });

    it('should increment from zero', () => {
      const state = { ...initializeGameState(), throwsRemaining: 0 };
      const newState = gameReducer(state, { type: 'INCREMENT_THROWS_REMAINING' });
      
      expect(newState.throwsRemaining).toBe(1);
    });
  });

  describe('THROW_YUT', () => {
    it('should add token to hand and decrement throws remaining', () => {
      const state = { ...initializeGameState(), throwsRemaining: 2, hand: [] };
      const token = { result: 'DO' as const, steps: 1 };
      const newState = gameReducer(state, { type: 'THROW_YUT', token });
      
      expect(newState.hand).toHaveLength(1);
      expect(newState.hand[0]).toEqual(token);
      expect(newState.throwsRemaining).toBe(1);
    });

    it('should grant bonus throw for YUT result', () => {
      const state = { ...initializeGameState(), throwsRemaining: 1, hand: [] };
      const token = { result: 'YUT' as const, steps: 4 };
      const newState = gameReducer(state, { type: 'THROW_YUT', token });
      
      expect(newState.hand).toHaveLength(1);
      expect(newState.throwsRemaining).toBe(1); // 1 - 1 + 1 (bonus)
    });

    it('should grant bonus throw for MO result', () => {
      const state = { ...initializeGameState(), throwsRemaining: 1, hand: [] };
      const token = { result: 'MO' as const, steps: 5 };
      const newState = gameReducer(state, { type: 'THROW_YUT', token });
      
      expect(newState.hand).toHaveLength(1);
      expect(newState.throwsRemaining).toBe(1); // 1 - 1 + 1 (bonus)
    });

    it('should not grant bonus throw for non-YUT/MO results', () => {
      const state = { ...initializeGameState(), throwsRemaining: 2, hand: [] };
      const token = { result: 'GAE' as const, steps: 2 };
      const newState = gameReducer(state, { type: 'THROW_YUT', token });
      
      expect(newState.throwsRemaining).toBe(1); // No bonus
    });

    it('should not go below zero throws remaining', () => {
      const state = { ...initializeGameState(), throwsRemaining: 0, hand: [] };
      const token = { result: 'DO' as const, steps: 1 };
      const newState = gameReducer(state, { type: 'THROW_YUT', token });
      
      expect(newState.throwsRemaining).toBe(0);
    });
  });

  describe('EXECUTE_MOVE', () => {
    it('should spawn piece from HOME', () => {
      const state = initializeGameState();
      const token = { result: 'DO' as const, steps: 1 };
      state.hand.push(token);
      state.phase = GamePhase.PLAY;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 0,
        target: { type: 'HOME' },
      });
      
      // Piece should be spawned at O1
      expect(newState.stacks).toHaveLength(1);
      expect(newState.stacks[0].position).toBe('O1');
      expect(newState.stacks[0].pieceIds).toEqual([0]);
      
      // Token should be removed
      expect(newState.hand).toHaveLength(0);
      
      // Selection should be cleared
      expect(newState.selectedTokenIndex).toBeUndefined();
      expect(newState.selectedNodeId).toBeUndefined();
    });

    it('should move stack on board', () => {
      const state = initializeGameState();
      // Setup: spawn a piece at O1 first
      state.stacks = [{
        id: 'test-stack',
        pieceIds: [0],
        position: 'O1',
      }];
      state.pieces[0] = {
        id: 0,
        state: 'ON_BOARD',
        position: 'O1',
      };
      const token = { result: 'GAE' as const, steps: 2 };
      state.hand.push(token);
      state.phase = GamePhase.PLAY;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 0,
        target: { type: 'STACK', stackId: 'test-stack' },
      });
      
      // Stack should be moved to O3
      expect(newState.stacks[0].position).toBe('O3');
      
      // Token should be removed
      expect(newState.hand).toHaveLength(0);
    });

    it('should auto-merge stacks when landing on occupied node', () => {
      const state = initializeGameState();
      // Setup: two stacks at O1 and O3
      state.stacks = [
        {
          id: 'stack1',
          pieceIds: [0],
          position: 'O1',
        },
        {
          id: 'stack2',
          pieceIds: [1],
          position: 'O3',
        },
      ];
      state.pieces[0] = { id: 0, state: 'ON_BOARD', position: 'O1' };
      state.pieces[1] = { id: 1, state: 'ON_BOARD', position: 'O3' };
      
      const token = { result: 'GAE' as const, steps: 2 };
      state.hand.push(token);
      state.phase = GamePhase.PLAY;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 0,
        target: { type: 'STACK', stackId: 'stack1' },
      });
      
      // Should have only one stack (merged)
      expect(newState.stacks).toHaveLength(1);
      expect(newState.stacks[0].pieceIds).toHaveLength(2);
      expect(newState.stacks[0].position).toBe('O3');
    });

    it('should handle FINISHED pieces', () => {
      const state = initializeGameState();
      // Setup: stack at O19
      state.stacks = [{
        id: 'test-stack',
        pieceIds: [0],
        position: 'O19',
      }];
      state.pieces[0] = {
        id: 0,
        state: 'ON_BOARD',
        position: 'O19',
      };
      
      const token = { result: 'GAE' as const, steps: 2 };
      state.hand.push(token);
      state.phase = GamePhase.PLAY;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 0,
        target: { type: 'STACK', stackId: 'test-stack' },
      });
      
      // Stack should be removed (finished)
      expect(newState.stacks).toHaveLength(0);
      
      // Piece should be marked FINISHED
      expect(newState.pieces[0].state).toBe('FINISHED');
      expect(newState.pieces[0].position).toBeNull();
    });

    it('should remove used hand token', () => {
      const state = initializeGameState();
      const token1 = { result: 'DO' as const, steps: 1 };
      const token2 = { result: 'GAE' as const, steps: 2 };
      const token3 = { result: 'GEOL' as const, steps: 3 };
      state.hand = [token1, token2, token3];
      state.phase = GamePhase.PLAY;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 1,
        target: { type: 'HOME' },
      });
      
      // Token at index 1 should be removed
      expect(newState.hand).toHaveLength(2);
      expect(newState.hand[0]).toEqual(token1);
      expect(newState.hand[1]).toEqual(token3);
    });

    it('should auto END_TURN when hand is empty after move', () => {
      const state = initializeGameState();
      state.hand = [{ result: 'DO' as const, steps: 1 }];
      state.phase = GamePhase.PLAY;
      state.turn = 1;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 0,
        target: { type: 'HOME' },
      });
      
      // Should advance to next turn
      expect(newState.phase).toBe('THROW');
      expect(newState.turn).toBe(2);
      expect(newState.throwsRemaining).toBe(1);
      expect(newState.hand).toHaveLength(0);
    });

    it('should stay in PLAY phase when hand has tokens remaining', () => {
      const state = initializeGameState();
      state.hand = [
        { result: 'DO' as const, steps: 1 },
        { result: 'GAE' as const, steps: 2 },
      ];
      state.phase = GamePhase.PLAY;
      state.turn = 1;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 0,
        target: { type: 'HOME' },
      });
      
      // Should stay in PLAY phase
      expect(newState.phase).toBe('PLAY');
      expect(newState.turn).toBe(1);
      expect(newState.hand).toHaveLength(1);
    });

    it('should transition to GAME_OVER when all pieces finished', () => {
      const state = initializeGameState();
      // Setup: 3 pieces already finished, 1 piece at O19
      state.pieces[0] = { id: 0, state: 'FINISHED', position: null };
      state.pieces[1] = { id: 1, state: 'FINISHED', position: null };
      state.pieces[2] = { id: 2, state: 'FINISHED', position: null };
      state.pieces[3] = { id: 3, state: 'ON_BOARD', position: 'O19' };
      state.stacks = [{
        id: 'last-stack',
        pieceIds: [3],
        position: 'O19',
      }];
      state.hand = [{ result: 'GAE' as const, steps: 2 }];
      state.phase = GamePhase.PLAY;
      
      const newState = gameReducer(state, {
        type: 'EXECUTE_MOVE',
        tokenIndex: 0,
        target: { type: 'STACK', stackId: 'last-stack' },
      });
      
      // Should transition to GAME_OVER
      expect(newState.phase).toBe('GAME_OVER');
      expect(newState.pieces.every(p => p.state === 'FINISHED')).toBe(true);
    });

    it('should throw error for invalid token index', () => {
      const state = initializeGameState();
      state.hand = [{ result: 'DO' as const, steps: 1 }];
      state.phase = GamePhase.PLAY;
      
      expect(() => {
        gameReducer(state, {
          type: 'EXECUTE_MOVE',
          tokenIndex: 5,
          target: { type: 'HOME' },
        });
      }).toThrow('Invalid token index');
    });
  });
});
