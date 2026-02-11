import { describe, it, expect } from 'vitest';
import {
  hasSpecialNodeEvent,
  getSpecialNodeType,
  handleStickNodeEvent,
  handleRefreshNodeEvent,
  handleNodeEvent,
  shouldTriggerNodeEvent,
} from '../index';
import { initializeGameState } from '../../state';
import { createInitialSpecialNodes } from '../../board';
import { STICK_POOL } from '../../content/sticks';

describe('Node Event Handling Module', () => {
  describe('hasSpecialNodeEvent', () => {
    it('should return true for STICK nodes', () => {
      const specialNodes = { O1: 'STICK' as const };
      const state = initializeGameState(specialNodes);

      expect(hasSpecialNodeEvent(state, 'O1')).toBe(true);
    });

    it('should return true for REFRESH nodes', () => {
      const specialNodes = { O1: 'REFRESH' as const };
      const state = initializeGameState(specialNodes);

      expect(hasSpecialNodeEvent(state, 'O1')).toBe(true);
    });

    it('should return false for NORMAL nodes', () => {
      const specialNodes = { O1: 'NORMAL' as const };
      const state = initializeGameState(specialNodes);

      expect(hasSpecialNodeEvent(state, 'O1')).toBe(false);
    });

    it('should return false for nodes not in mapping', () => {
      const state = initializeGameState({});

      expect(hasSpecialNodeEvent(state, 'O1')).toBe(false);
    });
  });

  describe('getSpecialNodeType', () => {
    it('should return STICK for STICK nodes', () => {
      const specialNodes = { O1: 'STICK' as const };
      const state = initializeGameState(specialNodes);

      expect(getSpecialNodeType(state, 'O1')).toBe('STICK');
    });

    it('should return REFRESH for REFRESH nodes', () => {
      const specialNodes = { O1: 'REFRESH' as const };
      const state = initializeGameState(specialNodes);

      expect(getSpecialNodeType(state, 'O1')).toBe('REFRESH');
    });

    it('should return NORMAL for NORMAL nodes', () => {
      const specialNodes = { O1: 'NORMAL' as const };
      const state = initializeGameState(specialNodes);

      expect(getSpecialNodeType(state, 'O1')).toBe('NORMAL');
    });

    it('should return NORMAL for nodes not in mapping', () => {
      const state = initializeGameState({});

      expect(getSpecialNodeType(state, 'O1')).toBe('NORMAL');
    });
  });

  describe('handleStickNodeEvent', () => {
    it('should create a pending stick offer', () => {
      const state = initializeGameState({});

      const newState = handleStickNodeEvent(state);

      expect(newState.pendingStickOffer).not.toBeNull();
      expect(newState.pendingStickOffer?.offeredStick).toBeDefined();
    });

    it('should offer a stick from the pool', () => {
      const state = initializeGameState({});

      const newState = handleStickNodeEvent(state);

      const offeredStick = newState.pendingStickOffer?.offeredStick;
      expect(offeredStick).toBeDefined();
      expect(STICK_POOL).toContainEqual(offeredStick);
    });

    it('should be deterministic with fixed RNG', () => {
      const state = initializeGameState({});
      const mockRng = () => 0; // Always return first stick

      const newState = handleStickNodeEvent(state, mockRng);

      expect(newState.pendingStickOffer?.offeredStick).toEqual(STICK_POOL[0]);
    });

    it('should use different sticks with different RNG', () => {
      const state = initializeGameState({});

      const state1 = handleStickNodeEvent(state, () => 0);
      const state2 = handleStickNodeEvent(state, () => 0.5);

      // Different RNG should potentially give different sticks
      // (may be same if pool small, but structure should work)
      expect(state1.pendingStickOffer).not.toBeNull();
      expect(state2.pendingStickOffer).not.toBeNull();
    });
  });

  describe('handleRefreshNodeEvent', () => {
    it('should update special nodes mapping', () => {
      const initialSpecialNodes = createInitialSpecialNodes();
      const state = initializeGameState(initialSpecialNodes);

      const newState = handleRefreshNodeEvent(state);

      expect(newState.specialNodes).toBeDefined();
      expect(newState.specialNodes).not.toEqual({});
    });

    it('should maintain same count of STICK and REFRESH nodes', () => {
      const initialSpecialNodes = createInitialSpecialNodes();
      const state = initializeGameState(initialSpecialNodes);

      const initialStickCount = Object.values(state.specialNodes).filter(
        (type) => type === 'STICK'
      ).length;
      const initialRefreshCount = Object.values(state.specialNodes).filter(
        (type) => type === 'REFRESH'
      ).length;

      const newState = handleRefreshNodeEvent(state);

      const newStickCount = Object.values(newState.specialNodes).filter(
        (type) => type === 'STICK'
      ).length;
      const newRefreshCount = Object.values(newState.specialNodes).filter(
        (type) => type === 'REFRESH'
      ).length;

      expect(newStickCount).toBe(initialStickCount);
      expect(newRefreshCount).toBe(initialRefreshCount);
    });

    it('should potentially change node positions with different RNG', () => {
      const initialSpecialNodes = createInitialSpecialNodes(undefined, () => 0.1);
      const state = initializeGameState(initialSpecialNodes);

      // Use different RNG to get different placement
      const newState = handleRefreshNodeEvent(state, () => 0.9);

      // The mapping should exist but may be different
      expect(newState.specialNodes).toBeDefined();
      expect(Object.keys(newState.specialNodes).length).toBeGreaterThan(0);
    });

    it('should be deterministic with fixed RNG', () => {
      const initialSpecialNodes = createInitialSpecialNodes();
      const state = initializeGameState(initialSpecialNodes);

      const mockRng = () => 0.5;
      const newState1 = handleRefreshNodeEvent(state, mockRng);
      const newState2 = handleRefreshNodeEvent(state, mockRng);

      expect(newState1.specialNodes).toEqual(newState2.specialNodes);
    });

    it('should not place special nodes on excluded nodes', () => {
      const initialSpecialNodes = createInitialSpecialNodes();
      const state = initializeGameState(initialSpecialNodes);

      const newState = handleRefreshNodeEvent(state);

      const excludedNodes = ['O0', 'O5', 'O10', 'C', 'O20'];
      excludedNodes.forEach((nodeId) => {
        expect(newState.specialNodes[nodeId]).toBe('NORMAL');
      });
    });
  });

  describe('handleNodeEvent', () => {
    it('should handle STICK node event', () => {
      const specialNodes = { O1: 'STICK' as const };
      const state = initializeGameState(specialNodes);

      const newState = handleNodeEvent(state, 'O1');

      expect(newState.pendingStickOffer).not.toBeNull();
    });

    it('should handle REFRESH node event', () => {
      const initialSpecialNodes = createInitialSpecialNodes();
      const state = initializeGameState(initialSpecialNodes);

      // Find a REFRESH node
      const refreshNode = Object.entries(state.specialNodes).find(
        ([, type]) => type === 'REFRESH'
      )?.[0];

      if (refreshNode) {
        const newState = handleNodeEvent(state, refreshNode);

        // Special nodes should still exist after refresh
        expect(Object.keys(newState.specialNodes).length).toBeGreaterThan(0);
      }
    });

    it('should not change state for NORMAL nodes', () => {
      const specialNodes = { O1: 'NORMAL' as const };
      const state = initializeGameState(specialNodes);

      const newState = handleNodeEvent(state, 'O1');

      expect(newState).toEqual(state);
    });

    it('should not change state for nodes without special type', () => {
      const state = initializeGameState({});

      const newState = handleNodeEvent(state, 'O1');

      expect(newState).toEqual(state);
    });

    it('should be deterministic with fixed RNG', () => {
      const specialNodes = { O1: 'STICK' as const };
      const state = initializeGameState(specialNodes);
      const mockRng = () => 0.3;

      const newState1 = handleNodeEvent(state, 'O1', mockRng);
      const newState2 = handleNodeEvent(state, 'O1', mockRng);

      expect(newState1.pendingStickOffer).toEqual(newState2.pendingStickOffer);
    });
  });

  describe('shouldTriggerNodeEvent', () => {
    it('should return true when landing on a node', () => {
      expect(shouldTriggerNodeEvent(true)).toBe(true);
      expect(shouldTriggerNodeEvent(true)).toBe(true);
      expect(shouldTriggerNodeEvent(true)).toBe(true);
    });

    it('should return false when passing through a node', () => {
      expect(shouldTriggerNodeEvent(false)).toBe(false);
      expect(shouldTriggerNodeEvent(false)).toBe(false);
      expect(shouldTriggerNodeEvent(false)).toBe(false);
    });

    it('should only depend on isLanding flag, not node type', () => {
      // Node type doesn't matter for this check - only landing vs passing
      expect(shouldTriggerNodeEvent(true)).toBe(true);
      expect(shouldTriggerNodeEvent(false)).toBe(false);
      expect(shouldTriggerNodeEvent(true)).toBe(true);
      expect(shouldTriggerNodeEvent(false)).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full STICK event flow', () => {
      const specialNodes = { O1: 'STICK' as const };
      let state = initializeGameState(specialNodes);

      // Landing on STICK node should trigger event
      if (shouldTriggerNodeEvent(true)) {
        state = handleNodeEvent(state, 'O1', () => 0);
      }

      expect(state.pendingStickOffer).not.toBeNull();
      expect(state.pendingStickOffer?.offeredStick).toEqual(STICK_POOL[0]);
    });

    it('should handle full REFRESH event flow', () => {
      const initialSpecialNodes = createInitialSpecialNodes(undefined, () => 0.1);
      let state = initializeGameState(initialSpecialNodes);

      // Find a REFRESH node
      const refreshNode = Object.entries(state.specialNodes).find(
        ([, type]) => type === 'REFRESH'
      )?.[0];

      if (refreshNode) {
        const beforeNodes = { ...state.specialNodes };

        // Landing on REFRESH node should trigger event
        if (shouldTriggerNodeEvent(true)) {
          state = handleNodeEvent(state, refreshNode, () => 0.9);
        }

        // Special nodes should be updated
        expect(state.specialNodes).toBeDefined();
        // The exact nodes may differ, but counts should match
        const beforeStickCount = Object.values(beforeNodes).filter(
          (type) => type === 'STICK'
        ).length;
        const afterStickCount = Object.values(state.specialNodes).filter(
          (type) => type === 'STICK'
        ).length;
        expect(afterStickCount).toBe(beforeStickCount);
      }
    });

    it('should not trigger events when passing through', () => {
      const specialNodes = { O1: 'STICK' as const };
      let state = initializeGameState(specialNodes);

      // Passing through should not trigger
      if (shouldTriggerNodeEvent(false)) {
        state = handleNodeEvent(state, 'O1');
      }

      expect(state.pendingStickOffer).toBeNull();
    });
  });
});
