import { describe, it, expect } from 'vitest';
import {
  BOARD_GRAPH,
  getBranchOptions,
  getNextNode,
  traverseSteps,
  isBranchNode,
  getEligibleNodes,
  createInitialSpecialNodes,
  DEFAULT_SPECIAL_NODE_CONFIG,
} from '../index';

describe('Board Graph Module', () => {
  describe('BOARD_GRAPH structure', () => {
    it('should have all outer path nodes from O0 to O20', () => {
      for (let i = 0; i <= 20; i++) {
        expect(BOARD_GRAPH[`O${i}`]).toBeDefined();
      }
    });

    it('should have center node C', () => {
      expect(BOARD_GRAPH['C']).toBeDefined();
      expect(BOARD_GRAPH['C'].isBranchNode).toBe(true);
    });

    it('should have diagonal A nodes (A1-A4)', () => {
      ['A1', 'A2', 'A3', 'A4'].forEach((node) => {
        expect(BOARD_GRAPH[node]).toBeDefined();
      });
    });

    it('should have diagonal B nodes (B1-B4)', () => {
      ['B1', 'B2', 'B3', 'B4'].forEach((node) => {
        expect(BOARD_GRAPH[node]).toBeDefined();
      });
    });

    it('should correctly identify branch nodes', () => {
      expect(BOARD_GRAPH['O5'].isBranchNode).toBe(true);
      expect(BOARD_GRAPH['O10'].isBranchNode).toBe(true);
      expect(BOARD_GRAPH['C'].isBranchNode).toBe(true);
      expect(BOARD_GRAPH['O15'].isBranchNode).toBe(false);
    });

    it('should have O20 with no next nodes', () => {
      expect(BOARD_GRAPH['O20'].next).toEqual([]);
    });
  });

  describe('getBranchOptions', () => {
    it('should return correct options for O5', () => {
      const options = getBranchOptions('O5');
      expect(options).toContain('OUTER');
      expect(options).toContain('DIAGONAL_A');
      expect(options.length).toBe(2);
    });

    it('should return correct options for O10', () => {
      const options = getBranchOptions('O10');
      expect(options).toContain('OUTER');
      expect(options).toContain('DIAGONAL_B');
      expect(options.length).toBe(2);
    });

    it('should return correct options for C', () => {
      const options = getBranchOptions('C');
      expect(options).toContain('TO_O15');
      expect(options).toContain('TO_O20');
      expect(options.length).toBe(2);
    });

    it('should return empty array for non-branch nodes', () => {
      expect(getBranchOptions('O1')).toEqual([]);
      expect(getBranchOptions('O15')).toEqual([]);
      expect(getBranchOptions('A1')).toEqual([]);
    });
  });

  describe('getNextNode', () => {
    it('should return next node for simple linear path', () => {
      expect(getNextNode('O1')).toBe('O2');
      expect(getNextNode('O2')).toBe('O3');
      expect(getNextNode('A1')).toBe('A2');
    });

    it('should return null for O20', () => {
      expect(getNextNode('O20')).toBe(null);
    });

    it('should return O6 for O5 with OUTER choice', () => {
      expect(getNextNode('O5', 'OUTER')).toBe('O6');
    });

    it('should return A1 for O5 with DIAGONAL_A choice', () => {
      expect(getNextNode('O5', 'DIAGONAL_A')).toBe('A1');
    });

    it('should return O11 for O10 with OUTER choice', () => {
      expect(getNextNode('O10', 'OUTER')).toBe('O11');
    });

    it('should return B1 for O10 with DIAGONAL_B choice', () => {
      expect(getNextNode('O10', 'DIAGONAL_B')).toBe('B1');
    });

    it('should return A3 for C with TO_O15 choice', () => {
      expect(getNextNode('C', 'TO_O15')).toBe('A3');
    });

    it('should return B3 for C with TO_O20 choice', () => {
      expect(getNextNode('C', 'TO_O20')).toBe('B3');
    });
  });

  describe('traverseSteps - HOME spawning scenarios', () => {
    it('should spawn at O1 with DO (1 step) from HOME', () => {
      expect(traverseSteps('O0', 1)).toBe('O1');
    });

    it('should spawn at O5 with MO (5 steps) from HOME', () => {
      expect(traverseSteps('O0', 5)).toBe('O5');
    });

    it('should not trigger branch at O5 when landing from HOME', () => {
      // Landing at O5 doesn't require branch choice
      expect(traverseSteps('O0', 5)).toBe('O5');
    });
  });

  describe('traverseSteps - branch selection scenarios', () => {
    it('should move from O5 to O6 with OUTER branch', () => {
      expect(traverseSteps('O5', 1, 'OUTER')).toBe('O6');
    });

    it('should move from O5 to A1 with DIAGONAL_A branch', () => {
      expect(traverseSteps('O5', 1, 'DIAGONAL_A')).toBe('A1');
    });

    it('should move from O10 to O11 with OUTER branch', () => {
      expect(traverseSteps('O10', 1, 'OUTER')).toBe('O11');
    });

    it('should move from O10 to B1 with DIAGONAL_B branch', () => {
      expect(traverseSteps('O10', 1, 'DIAGONAL_B')).toBe('B1');
    });

    it('should move from C to A3 with TO_O15 branch', () => {
      expect(traverseSteps('C', 1, 'TO_O15')).toBe('A3');
    });

    it('should move from C to B3 with TO_O20 branch', () => {
      expect(traverseSteps('C', 1, 'TO_O20')).toBe('B3');
    });
  });

  describe('traverseSteps - diagonal path traversal', () => {
    it('should traverse diagonal A: O5 -> A1 -> A2 -> C', () => {
      expect(traverseSteps('O5', 1, 'DIAGONAL_A')).toBe('A1');
      expect(traverseSteps('A1', 1)).toBe('A2');
      expect(traverseSteps('A2', 1)).toBe('C');
    });

    it('should traverse diagonal A exit: C -> A3 -> A4 -> O15', () => {
      expect(traverseSteps('C', 1, 'TO_O15')).toBe('A3');
      expect(traverseSteps('A3', 1)).toBe('A4');
      expect(traverseSteps('A4', 1)).toBe('O15');
    });

    it('should continue outer path from O15', () => {
      expect(traverseSteps('O15', 1)).toBe('O16');
    });

    it('should traverse diagonal B: O10 -> B1 -> B2 -> C', () => {
      expect(traverseSteps('O10', 1, 'DIAGONAL_B')).toBe('B1');
      expect(traverseSteps('B1', 1)).toBe('B2');
      expect(traverseSteps('B2', 1)).toBe('C');
    });

    it('should traverse diagonal B exit: C -> B3 -> B4 -> O20', () => {
      expect(traverseSteps('C', 1, 'TO_O20')).toBe('B3');
      expect(traverseSteps('B3', 1)).toBe('B4');
      expect(traverseSteps('B4', 1)).toBe('O20');
    });
  });

  describe('traverseSteps - finish scenarios (overshoot rule)', () => {
    it('should NOT finish when landing exactly on O20', () => {
      expect(traverseSteps('O19', 1)).toBe('O20');
    });

    it('should finish when moving from O20 (overshoot)', () => {
      expect(traverseSteps('O20', 1)).toBe('FINISHED');
    });

    it('should finish when overshooting O20 from O19', () => {
      expect(traverseSteps('O19', 2)).toBe('FINISHED');
    });

    it('should finish when overshooting O20 from O18', () => {
      expect(traverseSteps('O18', 3)).toBe('FINISHED');
    });

    it('should finish through diagonal B path', () => {
      expect(traverseSteps('B4', 1)).toBe('O20');
      expect(traverseSteps('B4', 2)).toBe('FINISHED');
    });
  });

  describe('traverseSteps - multi-step movements', () => {
    it('should traverse multiple steps from O1', () => {
      expect(traverseSteps('O1', 3)).toBe('O4');
    });

    it('should traverse multiple steps with branch at start', () => {
      expect(traverseSteps('O5', 3, 'DIAGONAL_A')).toBe('C');
    });

    it('should traverse through diagonal and beyond', () => {
      // O10 -> B1 -> B2 -> C -> (needs branch choice)
      expect(traverseSteps('O10', 3, 'DIAGONAL_B')).toBe('C');
    });

    it('should return same node with 0 steps', () => {
      expect(traverseSteps('O5', 0)).toBe('O5');
    });
  });

  describe('isBranchNode', () => {
    it('should identify O5 as branch node', () => {
      expect(isBranchNode('O5')).toBe(true);
    });

    it('should identify O10 as branch node', () => {
      expect(isBranchNode('O10')).toBe(true);
    });

    it('should identify C as branch node', () => {
      expect(isBranchNode('C')).toBe(true);
    });

    it('should identify O15 as NOT a branch node', () => {
      expect(isBranchNode('O15')).toBe(false);
    });

    it('should identify regular nodes as NOT branch nodes', () => {
      expect(isBranchNode('O1')).toBe(false);
      expect(isBranchNode('A1')).toBe(false);
      expect(isBranchNode('B1')).toBe(false);
    });
  });

  describe('Special Node System', () => {
    describe('getEligibleNodes', () => {
      it('should exclude default excluded nodes (O0, O5, O10, C, O20)', () => {
        const eligible = getEligibleNodes();
        expect(eligible).not.toContain('O0');
        expect(eligible).not.toContain('O5');
        expect(eligible).not.toContain('O10');
        expect(eligible).not.toContain('C');
        expect(eligible).not.toContain('O20');
      });

      it('should include non-branch outer nodes', () => {
        const eligible = getEligibleNodes();
        expect(eligible).toContain('O1');
        expect(eligible).toContain('O2');
        expect(eligible).toContain('O19');
      });

      it('should include diagonal nodes', () => {
        const eligible = getEligibleNodes();
        expect(eligible).toContain('A1');
        expect(eligible).toContain('A2');
        expect(eligible).toContain('B1');
        expect(eligible).toContain('B2');
      });

      it('should respect custom excluded nodes', () => {
        const eligible = getEligibleNodes(['O1', 'O2', 'A1']);
        expect(eligible).not.toContain('O1');
        expect(eligible).not.toContain('O2');
        expect(eligible).not.toContain('A1');
        expect(eligible).toContain('O3');
        expect(eligible).toContain('A2');
      });
    });

    describe('DEFAULT_SPECIAL_NODE_CONFIG', () => {
      it('should have correct default values', () => {
        expect(DEFAULT_SPECIAL_NODE_CONFIG.stickCount).toBe(5);
        expect(DEFAULT_SPECIAL_NODE_CONFIG.refreshCount).toBe(2);
        expect(DEFAULT_SPECIAL_NODE_CONFIG.excludedNodeIds).toEqual([
          'O0',
          'O5',
          'O10',
          'C',
          'O20',
        ]);
      });
    });

    describe('createInitialSpecialNodes', () => {
      it('should initialize all nodes as NORMAL by default', () => {
        const specialNodes = createInitialSpecialNodes();
        
        // Count NORMAL, STICK, and REFRESH nodes
        const counts = { NORMAL: 0, STICK: 0, REFRESH: 0 };
        Object.values(specialNodes).forEach(type => {
          counts[type]++;
        });

        expect(counts.STICK).toBe(5);
        expect(counts.REFRESH).toBe(2);
        expect(counts.NORMAL).toBeGreaterThan(0);
      });

      it('should not place special nodes on excluded nodes', () => {
        const specialNodes = createInitialSpecialNodes();
        
        expect(specialNodes['O0']).toBe('NORMAL');
        expect(specialNodes['O5']).toBe('NORMAL');
        expect(specialNodes['O10']).toBe('NORMAL');
        expect(specialNodes['C']).toBe('NORMAL');
        expect(specialNodes['O20']).toBe('NORMAL');
      });

      it('should place exactly stickCount STICK nodes', () => {
        const specialNodes = createInitialSpecialNodes();
        const stickNodes = Object.values(specialNodes).filter(
          (type) => type === 'STICK'
        );
        expect(stickNodes).toHaveLength(5);
      });

      it('should place exactly refreshCount REFRESH nodes', () => {
        const specialNodes = createInitialSpecialNodes();
        const refreshNodes = Object.values(specialNodes).filter(
          (type) => type === 'REFRESH'
        );
        expect(refreshNodes).toHaveLength(2);
      });

      it('should respect custom config', () => {
        const customConfig = {
          stickCount: 3,
          refreshCount: 1,
          excludedNodeIds: ['O0', 'O5', 'O10', 'C', 'O20'],
        };
        const specialNodes = createInitialSpecialNodes(customConfig);
        
        const stickNodes = Object.values(specialNodes).filter(
          (type) => type === 'STICK'
        );
        const refreshNodes = Object.values(specialNodes).filter(
          (type) => type === 'REFRESH'
        );
        
        expect(stickNodes).toHaveLength(3);
        expect(refreshNodes).toHaveLength(1);
      });

      it('should be deterministic with fixed RNG', () => {
        let callCount = 0;
        const mockRng = () => {
          // Return predictable sequence
          const values = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
          return values[callCount++ % values.length];
        };

        const result1 = createInitialSpecialNodes(undefined, mockRng);
        callCount = 0; // Reset
        const result2 = createInitialSpecialNodes(undefined, mockRng);

        expect(result1).toEqual(result2);
      });

      it('should throw error if not enough eligible nodes', () => {
        const impossibleConfig = {
          stickCount: 100,
          refreshCount: 100,
          excludedNodeIds: Object.keys(BOARD_GRAPH),
        };

        expect(() => createInitialSpecialNodes(impossibleConfig)).toThrow();
      });

      it('should distribute special nodes among eligible nodes', () => {
        const specialNodes = createInitialSpecialNodes();
        
        // Verify that special nodes are only placed on eligible nodes
        const eligibleNodes = getEligibleNodes();
        
        Object.entries(specialNodes).forEach(([nodeId, type]) => {
          if (type !== 'NORMAL') {
            expect(eligibleNodes).toContain(nodeId);
          }
        });
      });
    });
  });
});
