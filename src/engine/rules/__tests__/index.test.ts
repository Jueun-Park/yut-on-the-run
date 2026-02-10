import { describe, it, expect } from 'vitest';
import {
  validateMove,
  executeMove,
  getValidMoveTargets,
} from '../index';
import {
  initializeGameState,
  spawnPieceFromHome,
} from '../../state';

describe('Rules Module', () => {
  describe('validateMove - HOME spawning', () => {
    it('should validate HOME spawn with DO (1 step) to O1', () => {
      const state = initializeGameState();
      const result = validateMove(state, { type: 'HOME' }, 1);

      expect(result.finalPosition).toBe('O1');
      expect(result.isFinished).toBe(false);
      expect(result.needsBranchChoice).toBe(false);
    });

    it('should validate HOME spawn with MO (5 steps) to O5', () => {
      const state = initializeGameState();
      const result = validateMove(state, { type: 'HOME' }, 5);

      expect(result.finalPosition).toBe('O5');
      expect(result.isFinished).toBe(false);
      expect(result.needsBranchChoice).toBe(false);
    });

    it('should throw error when no pieces at HOME', () => {
      let state = initializeGameState();

      // Spawn all 4 pieces
      for (let i = 0; i < 4; i++) {
        state = spawnPieceFromHome(state, `O${i + 1}`);
      }

      expect(() => validateMove(state, { type: 'HOME' }, 1)).toThrow(
        'No pieces at HOME to spawn'
      );
    });
  });

  describe('validateMove - branch detection', () => {
    it('should detect branch at O5', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');
      const stackId = state.stacks[0].id;

      const result = validateMove(state, { type: 'STACK', stackId }, 1);

      expect(result.needsBranchChoice).toBe(true);
      expect(result.availableBranches).toContain('OUTER');
      expect(result.availableBranches).toContain('DIAGONAL_A');
    });

    it('should detect branch at O10', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O10');
      const stackId = state.stacks[0].id;

      const result = validateMove(state, { type: 'STACK', stackId }, 1);

      expect(result.needsBranchChoice).toBe(true);
      expect(result.availableBranches).toContain('OUTER');
      expect(result.availableBranches).toContain('DIAGONAL_B');
    });

    it('should detect branch at C', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'C');
      const stackId = state.stacks[0].id;

      const result = validateMove(state, { type: 'STACK', stackId }, 1);

      expect(result.needsBranchChoice).toBe(true);
      expect(result.availableBranches).toContain('TO_O15');
      expect(result.availableBranches).toContain('TO_O20');
    });

    it('should NOT detect branch at O15', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O15');
      const stackId = state.stacks[0].id;

      const result = validateMove(state, { type: 'STACK', stackId }, 1);

      expect(result.needsBranchChoice).toBe(false);
      expect(result.finalPosition).toBe('O16');
    });
  });

  describe('validateMove - finish detection', () => {
    it('should NOT finish when landing on O20', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O19');
      const stackId = state.stacks[0].id;

      const result = validateMove(state, { type: 'STACK', stackId }, 1);

      expect(result.finalPosition).toBe('O20');
      expect(result.isFinished).toBe(false);
    });

    it('should finish when moving from O20 (overshoot)', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O20');
      const stackId = state.stacks[0].id;

      const result = validateMove(state, { type: 'STACK', stackId }, 1);

      expect(result.finalPosition).toBe('FINISHED');
      expect(result.isFinished).toBe(true);
    });

    it('should finish when overshooting O20 from O19', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O19');
      const stackId = state.stacks[0].id;

      const result = validateMove(state, { type: 'STACK', stackId }, 2);

      expect(result.finalPosition).toBe('FINISHED');
      expect(result.isFinished).toBe(true);
    });
  });

  describe('executeMove - HOME spawning', () => {
    it('should spawn piece from HOME to O1', () => {
      const state = initializeGameState();
      const newState = executeMove(state, { type: 'HOME' }, 1);

      expect(newState.stacks).toHaveLength(1);
      expect(newState.stacks[0].position).toBe('O1');
      expect(newState.stacks[0].pieceIds).toEqual([0]);
    });

    it('should spawn piece from HOME to O5', () => {
      const state = initializeGameState();
      const newState = executeMove(state, { type: 'HOME' }, 5);

      expect(newState.stacks).toHaveLength(1);
      expect(newState.stacks[0].position).toBe('O5');
    });
  });

  describe('executeMove - stack movement', () => {
    it('should move stack from O1 to O4', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 3);

      expect(newState.stacks[0].position).toBe('O4');
    });

    it('should move stack with OUTER branch choice at O5', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 1, 'OUTER');

      expect(newState.stacks[0].position).toBe('O6');
    });

    it('should move stack with DIAGONAL_A branch choice at O5', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 1, 'DIAGONAL_A');

      expect(newState.stacks[0].position).toBe('A1');
    });

    it('should move stack with DIAGONAL_B branch choice at O10', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O10');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 1, 'DIAGONAL_B');

      expect(newState.stacks[0].position).toBe('B1');
    });

    it('should move stack with TO_O15 branch choice at C', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'C');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 1, 'TO_O15');

      expect(newState.stacks[0].position).toBe('A3');
    });

    it('should move stack with TO_O20 branch choice at C', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'C');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 1, 'TO_O20');

      expect(newState.stacks[0].position).toBe('B3');
    });
  });

  describe('executeMove - automatic merging (stacking)', () => {
    it('should auto-merge when spawning on occupied node', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');

      // Spawn another piece to O5
      state = executeMove(state, { type: 'HOME' }, 5);

      expect(state.stacks).toHaveLength(1);
      expect(state.stacks[0].pieceIds).toHaveLength(2);
      expect(state.stacks[0].pieceIds).toContain(0);
      expect(state.stacks[0].pieceIds).toContain(1);
    });

    it('should auto-merge when moving stack to occupied node', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[1].id;

      // Move O1 stack to O5
      state = executeMove(state, { type: 'STACK', stackId }, 4);

      expect(state.stacks).toHaveLength(1);
      expect(state.stacks[0].pieceIds).toHaveLength(2);
    });

    it('should NOT merge when landing on different nodes', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');
      state = spawnPieceFromHome(state, 'O1');

      expect(state.stacks).toHaveLength(2);
      expect(state.stacks[0].pieceIds).toHaveLength(1);
      expect(state.stacks[1].pieceIds).toHaveLength(1);
    });
  });

  describe('executeMove - finish scenarios', () => {
    it('should finish stack when moving from O20', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O20');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 1);

      expect(newState.stacks).toHaveLength(0);
      expect(newState.pieces[0].state).toBe('FINISHED');
    });

    it('should finish stack when overshooting O20', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O19');
      const stackId = state.stacks[0].id;

      const newState = executeMove(state, { type: 'STACK', stackId }, 2);

      expect(newState.stacks).toHaveLength(0);
      expect(newState.pieces[0].state).toBe('FINISHED');
    });
  });

  describe('getValidMoveTargets', () => {
    it('should include HOME when pieces are at HOME', () => {
      const state = initializeGameState();
      const targets = getValidMoveTargets(state);

      const homeTarget = targets.find((t) => t.type === 'HOME');
      expect(homeTarget).toBeDefined();
    });

    it('should NOT include HOME when no pieces at HOME', () => {
      let state = initializeGameState();

      // Spawn all pieces
      for (let i = 0; i < 4; i++) {
        state = spawnPieceFromHome(state, `O${i + 1}`);
      }

      const targets = getValidMoveTargets(state);
      const homeTarget = targets.find((t) => t.type === 'HOME');
      expect(homeTarget).toBeUndefined();
    });

    it('should include all stacks on board', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      state = spawnPieceFromHome(state, 'O5');

      const targets = getValidMoveTargets(state);
      const stackTargets = targets.filter((t) => t.type === 'STACK');

      expect(stackTargets).toHaveLength(2);
    });

    it('should return only HOME target initially', () => {
      const state = initializeGameState();
      const targets = getValidMoveTargets(state);

      expect(targets).toHaveLength(1);
      expect(targets[0].type).toBe('HOME');
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid move target type', () => {
      const state = initializeGameState();

      expect(() =>
        validateMove(state, { type: 'INVALID' } as never, 1)
      ).toThrow('Invalid move target type');
    });

    it('should throw error when stack ID missing for STACK move', () => {
      const state = initializeGameState();

      expect(() =>
        validateMove(state, { type: 'STACK' }, 1)
      ).toThrow('Stack ID required for STACK move');
    });

    it('should throw error for non-existent stack', () => {
      const state = initializeGameState();

      expect(() =>
        validateMove(state, { type: 'STACK', stackId: 'invalid' }, 1)
      ).toThrow('Stack not found');
    });
  });
});
