import { describe, it, expect } from 'vitest';
import {
  GamePhase,
  PieceState,
  initializeGameState,
  getHomePieces,
  getFinishedCount,
  isGameOver,
  findStackAtPosition,
  mergeStacks,
  spawnPieceFromHome,
  moveStack,
  finishStack,
  addHandToken,
  removeHandToken,
  transitionToPlay,
  transitionToReward,
  completeReward,
  advanceTurn,
} from '../index';

describe('State Module', () => {
  describe('initializeGameState', () => {
    it('should initialize with correct default values', () => {
      const state = initializeGameState();

      expect(state.phase).toBe(GamePhase.THROW);
      expect(state.turn).toBe(1);
      expect(state.throwsRemaining).toBe(1);
      expect(state.hand).toEqual([]);
      expect(state.pieces).toHaveLength(4);
      expect(state.stacks).toEqual([]);
      expect(state.artifacts).toEqual([]);
      expect(state.pendingReward).toBeNull();
    });

    it('should initialize all pieces at HOME', () => {
      const state = initializeGameState();

      state.pieces.forEach((piece, index) => {
        expect(piece.id).toBe(index);
        expect(piece.state).toBe(PieceState.HOME);
        expect(piece.position).toBeNull();
      });
    });
  });

  describe('getHomePieces', () => {
    it('should return all pieces at HOME initially', () => {
      const state = initializeGameState();
      const homePieces = getHomePieces(state);

      expect(homePieces).toHaveLength(4);
    });

    it('should return fewer pieces after spawning', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');

      const homePieces = getHomePieces(state);
      expect(homePieces).toHaveLength(3);
    });
  });

  describe('getFinishedCount', () => {
    it('should return 0 initially', () => {
      const state = initializeGameState();
      expect(getFinishedCount(state)).toBe(0);
    });

    it('should count finished pieces correctly', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[0].id;
      state = finishStack(state, stackId);

      expect(getFinishedCount(state)).toBe(1);
    });
  });

  describe('isGameOver', () => {
    it('should return false initially', () => {
      const state = initializeGameState();
      expect(isGameOver(state)).toBe(false);
    });

    it('should return true when all 4 pieces are finished', () => {
      let state = initializeGameState();

      // Finish all 4 pieces
      for (let i = 0; i < 4; i++) {
        state = spawnPieceFromHome(state, 'O1');
        const stackId = state.stacks[state.stacks.length - 1].id;
        state = finishStack(state, stackId);
      }

      expect(isGameOver(state)).toBe(true);
    });
  });

  describe('spawnPieceFromHome', () => {
    it('should spawn first piece from HOME', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');

      expect(state.stacks).toHaveLength(1);
      expect(state.stacks[0].position).toBe('O1');
      expect(state.stacks[0].pieceIds).toEqual([0]);
    });

    it('should update piece state correctly', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');

      const piece = state.pieces.find((p) => p.id === 0);
      expect(piece?.state).toBe(PieceState.ON_BOARD);
      expect(piece?.position).toBe('O1');
    });

    it('should throw error when no pieces at HOME', () => {
      let state = initializeGameState();

      // Spawn all pieces
      for (let i = 0; i < 4; i++) {
        state = spawnPieceFromHome(state, `O${i + 1}`);
      }

      expect(() => spawnPieceFromHome(state, 'O5')).toThrow(
        'No pieces at HOME to spawn'
      );
    });
  });

  describe('moveStack', () => {
    it('should move stack to new position', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[0].id;

      state = moveStack(state, stackId, 'O5');

      expect(state.stacks[0].position).toBe('O5');
    });

    it('should update piece positions', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[0].id;

      state = moveStack(state, stackId, 'O5');

      const piece = state.pieces.find((p) => p.id === 0);
      expect(piece?.position).toBe('O5');
    });

    it('should throw error for non-existent stack', () => {
      const state = initializeGameState();

      expect(() => moveStack(state, 'invalid-id', 'O1')).toThrow('Stack not found');
    });
  });

  describe('finishStack', () => {
    it('should remove stack from board', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[0].id;

      state = finishStack(state, stackId);

      expect(state.stacks).toHaveLength(0);
    });

    it('should mark pieces as FINISHED', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[0].id;

      state = finishStack(state, stackId);

      const piece = state.pieces.find((p) => p.id === 0);
      expect(piece?.state).toBe(PieceState.FINISHED);
      expect(piece?.position).toBeNull();
    });
  });

  describe('findStackAtPosition', () => {
    it('should find stack at given position', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');

      const stack = findStackAtPosition(state, 'O5');
      expect(stack).not.toBeNull();
      expect(stack?.position).toBe('O5');
    });

    it('should return null when no stack at position', () => {
      const state = initializeGameState();

      const stack = findStackAtPosition(state, 'O5');
      expect(stack).toBeNull();
    });
  });

  describe('mergeStacks', () => {
    it('should merge two stacks at same position', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O5');
      state = spawnPieceFromHome(state, 'O5');

      const stack1Id = state.stacks[0].id;
      const stack2Id = state.stacks[1].id;

      state = mergeStacks(state, stack1Id, stack2Id);

      expect(state.stacks).toHaveLength(1);
      expect(state.stacks[0].pieceIds).toHaveLength(2);
      expect(state.stacks[0].pieceIds).toContain(0);
      expect(state.stacks[0].pieceIds).toContain(1);
    });

    it('should throw error when stacks not at same position', () => {
      let state = initializeGameState();
      state = spawnPieceFromHome(state, 'O1');
      state = spawnPieceFromHome(state, 'O5');

      const stack1Id = state.stacks[0].id;
      const stack2Id = state.stacks[1].id;

      expect(() => mergeStacks(state, stack1Id, stack2Id)).toThrow(
        'Cannot merge: stacks not at same position'
      );
    });
  });

  describe('hand token management', () => {
    it('should add hand token', () => {
      let state = initializeGameState();
      const token = { result: 'DO' as const, steps: 1 };

      state = addHandToken(state, token);

      expect(state.hand).toHaveLength(1);
      expect(state.hand[0]).toEqual(token);
    });

    it('should remove hand token at index', () => {
      let state = initializeGameState();
      state = addHandToken(state, { result: 'DO', steps: 1 });
      state = addHandToken(state, { result: 'GAE', steps: 2 });

      state = removeHandToken(state, 0);

      expect(state.hand).toHaveLength(1);
      expect(state.hand[0].result).toBe('GAE');
    });

    it('should accumulate multiple tokens', () => {
      let state = initializeGameState();
      state = addHandToken(state, { result: 'DO', steps: 1 });
      state = addHandToken(state, { result: 'GAE', steps: 2 });
      state = addHandToken(state, { result: 'GEOL', steps: 3 });

      expect(state.hand).toHaveLength(3);
    });
  });

  describe('phase transitions', () => {
    it('should transition from THROW to PLAY', () => {
      let state = initializeGameState();
      state = transitionToPlay(state);

      expect(state.phase).toBe(GamePhase.PLAY);
    });

    it('should throw error when transitioning to PLAY from wrong phase', () => {
      let state = initializeGameState();
      state.phase = GamePhase.PLAY;

      expect(() => transitionToPlay(state)).toThrow(
        'Can only transition to PLAY from THROW phase'
      );
    });

    it('should transition to REWARD phase', () => {
      let state = initializeGameState();
      const artifact = { id: 'a1', name: 'Test', description: 'Test artifact' };

      state = transitionToReward(state, 1, [artifact]);

      expect(state.phase).toBe(GamePhase.REWARD);
      expect(state.pendingReward).not.toBeNull();
      expect(state.pendingReward?.stackSize).toBe(1);
      expect(state.pendingReward?.candidates).toHaveLength(1);
    });

    it('should complete reward and return to PLAY when hand not empty', () => {
      let state = initializeGameState();
      state = addHandToken(state, { result: 'DO', steps: 1 });
      const artifact = { id: 'a1', name: 'Test', description: 'Test artifact' };

      state = transitionToReward(state, 1, [artifact]);
      state = completeReward(state, artifact);

      expect(state.phase).toBe(GamePhase.PLAY);
      expect(state.artifacts).toHaveLength(1);
      expect(state.pendingReward).toBeNull();
    });

    it('should advance turn after reward when hand is empty', () => {
      let state = initializeGameState();
      const artifact = { id: 'a1', name: 'Test', description: 'Test artifact' };

      state = transitionToReward(state, 1, [artifact]);
      state = completeReward(state, artifact);

      expect(state.phase).toBe(GamePhase.THROW);
      expect(state.turn).toBe(2);
      expect(state.throwsRemaining).toBe(1);
    });

    it('should transition to GAME_OVER when completing with all pieces finished', () => {
      let state = initializeGameState();

      // Finish all but one piece
      for (let i = 0; i < 3; i++) {
        state = spawnPieceFromHome(state, 'O1');
        const stackId = state.stacks[state.stacks.length - 1].id;
        state = finishStack(state, stackId);
      }

      // Finish last piece through reward
      state = spawnPieceFromHome(state, 'O1');
      const stackId = state.stacks[0].id;
      state = finishStack(state, stackId);

      const artifact = { id: 'a1', name: 'Test', description: 'Test artifact' };
      state = transitionToReward(state, 1, [artifact]);
      state = completeReward(state, artifact);

      expect(state.phase).toBe(GamePhase.GAME_OVER);
    });
  });

  describe('advanceTurn', () => {
    it('should advance turn when hand is empty', () => {
      let state = initializeGameState();
      state.phase = GamePhase.PLAY;

      state = advanceTurn(state);

      expect(state.phase).toBe(GamePhase.THROW);
      expect(state.turn).toBe(2);
      expect(state.throwsRemaining).toBe(1);
    });

    it('should throw error when hand is not empty', () => {
      let state = initializeGameState();
      state = addHandToken(state, { result: 'DO', steps: 1 });

      expect(() => advanceTurn(state)).toThrow('Cannot advance turn: hand is not empty');
    });
  });
});
