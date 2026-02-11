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
  offerStick,
  replaceStickInInventory,
  discardStickOffer,
  updateSpecialNodes,
} from '../index';
import { BASIC_STICK, STICK_POOL } from '../../content/sticks';
import { createInitialSpecialNodes } from '../../board';

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
      expect(state.stickInventory).toHaveLength(4);
      expect(state.specialNodes).toEqual({});
      expect(state.pendingReward).toBeNull();
      expect(state.pendingStickOffer).toBeNull();
    });

    it('should initialize all pieces at HOME', () => {
      const state = initializeGameState();

      state.pieces.forEach((piece, index) => {
        expect(piece.id).toBe(index);
        expect(piece.state).toBe(PieceState.HOME);
        expect(piece.position).toBeNull();
      });
    });

    it('should initialize stick inventory with 4 BASIC_STICKs', () => {
      const state = initializeGameState();

      expect(state.stickInventory).toHaveLength(4);
      state.stickInventory.forEach((stick) => {
        expect(stick).toEqual(BASIC_STICK);
      });
    });

    it('should initialize with empty special nodes by default', () => {
      const state = initializeGameState();

      expect(state.specialNodes).toEqual({});
    });

    it('should accept pre-initialized special nodes', () => {
      const specialNodes = createInitialSpecialNodes();
      const state = initializeGameState(specialNodes);

      expect(state.specialNodes).toEqual(specialNodes);
    });

    it('should initialize with no pending stick offer', () => {
      const state = initializeGameState();

      expect(state.pendingStickOffer).toBeNull();
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
      const state = initializeGameState();
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

  describe('Stick Inventory Management', () => {
    describe('offerStick', () => {
      it('should create a pending stick offer', () => {
        const state = initializeGameState();
        const offeredStick = STICK_POOL[0];

        const newState = offerStick(state, offeredStick);

        expect(newState.pendingStickOffer).not.toBeNull();
        expect(newState.pendingStickOffer?.offeredStick).toEqual(offeredStick);
      });

      it('should throw error if pending offer already exists', () => {
        let state = initializeGameState();
        state = offerStick(state, STICK_POOL[0]);

        expect(() => offerStick(state, STICK_POOL[1])).toThrow(
          'Cannot offer stick: pending offer already exists'
        );
      });
    });

    describe('replaceStickInInventory', () => {
      it('should replace stick at specified slot', () => {
        let state = initializeGameState();
        const offeredStick = STICK_POOL[0];
        state = offerStick(state, offeredStick);

        const newState = replaceStickInInventory(state, 0);

        expect(newState.stickInventory[0]).toEqual(offeredStick);
        expect(newState.stickInventory[1]).toEqual(BASIC_STICK);
        expect(newState.stickInventory[2]).toEqual(BASIC_STICK);
        expect(newState.stickInventory[3]).toEqual(BASIC_STICK);
        expect(newState.pendingStickOffer).toBeNull();
      });

      it('should replace stick at each slot independently', () => {
        for (let slot = 0; slot < 4; slot++) {
          let state = initializeGameState();
          const offeredStick = STICK_POOL[slot];
          state = offerStick(state, offeredStick);

          const newState = replaceStickInInventory(state, slot);

          expect(newState.stickInventory[slot]).toEqual(offeredStick);
          // Other slots should still have BASIC_STICK
          for (let i = 0; i < 4; i++) {
            if (i !== slot) {
              expect(newState.stickInventory[i]).toEqual(BASIC_STICK);
            }
          }
        }
      });

      it('should throw error if no pending offer', () => {
        const state = initializeGameState();

        expect(() => replaceStickInInventory(state, 0)).toThrow(
          'Cannot replace stick: no pending offer'
        );
      });

      it('should throw error for invalid slot index', () => {
        let state = initializeGameState();
        state = offerStick(state, STICK_POOL[0]);

        expect(() => replaceStickInInventory(state, -1)).toThrow(
          'Invalid slot index: must be 0-3'
        );
        expect(() => replaceStickInInventory(state, 4)).toThrow(
          'Invalid slot index: must be 0-3'
        );
      });
    });

    describe('discardStickOffer', () => {
      it('should clear pending offer without changing inventory', () => {
        let state = initializeGameState();
        const originalInventory = [...state.stickInventory];
        state = offerStick(state, STICK_POOL[0]);

        const newState = discardStickOffer(state);

        expect(newState.pendingStickOffer).toBeNull();
        expect(newState.stickInventory).toEqual(originalInventory);
      });

      it('should throw error if no pending offer', () => {
        const state = initializeGameState();

        expect(() => discardStickOffer(state)).toThrow(
          'Cannot discard stick: no pending offer'
        );
      });
    });
  });

  describe('Special Node Event Handling', () => {
    describe('updateSpecialNodes', () => {
      it('should update special nodes mapping', () => {
        const state = initializeGameState();
        const newSpecialNodes = createInitialSpecialNodes();

        const newState = updateSpecialNodes(state, newSpecialNodes);

        expect(newState.specialNodes).toEqual(newSpecialNodes);
      });

      it('should replace existing special nodes mapping', () => {
        const initialSpecialNodes = createInitialSpecialNodes();
        let state = initializeGameState(initialSpecialNodes);
        
        // Create a different special nodes mapping
        const newSpecialNodes = createInitialSpecialNodes(undefined, () => 0.5);

        const newState = updateSpecialNodes(state, newSpecialNodes);

        expect(newState.specialNodes).toEqual(newSpecialNodes);
        expect(newState.specialNodes).not.toEqual(initialSpecialNodes);
      });
    });
  });
});
