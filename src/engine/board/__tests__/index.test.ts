import { describe, it, expect } from 'vitest';
import {
  BOARD_GRAPH,
  BRANCH_NODES,
  getBranchOptions,
  getNextNode,
  traverseSteps,
  isBranchNode,
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
});
