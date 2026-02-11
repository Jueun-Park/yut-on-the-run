/**
 * Board Graph Module
 *
 * Defines the yut board structure with nodes and connections:
 * - Outer path: O0 (HOME) through O20
 * - Center node: C
 * - Diagonal A: O5 → A1 → A2 → C → A3 → A4 → O15
 * - Diagonal B: O10 → B1 → B2 → C → B3 → B4 → O20
 */

export type NodeId = string; // e.g., "O0", "O1", ..., "O20", "C", "A1", ..., "A4", "B1", ..., "B4"

export type BranchOption = 'OUTER' | 'DIAGONAL_A' | 'DIAGONAL_B' | 'TO_O15' | 'TO_O20';

export interface BoardNode {
  id: NodeId;
  isBranchNode: boolean;
  // Next nodes - can have multiple options at branch points
  next: NodeId[];
}

/**
 * Branch nodes where player must choose a path when starting movement
 */
export const BRANCH_NODES = {
  O5: 'O5',   // Choose: O6 (outer) or A1 (diagonal A)
  O10: 'O10', // Choose: O11 (outer) or B1 (diagonal B)
  C: 'C',     // Choose: A3 (to O15) or B3 (to O20)
} as const;

/**
 * Complete board graph structure
 */
export const BOARD_GRAPH: Record<NodeId, BoardNode> = {
  // Outer path O0 (HOME) through O20
  O0: { id: 'O0', isBranchNode: false, next: ['O1'] },
  O1: { id: 'O1', isBranchNode: false, next: ['O2'] },
  O2: { id: 'O2', isBranchNode: false, next: ['O3'] },
  O3: { id: 'O3', isBranchNode: false, next: ['O4'] },
  O4: { id: 'O4', isBranchNode: false, next: ['O5'] },
  O5: { id: 'O5', isBranchNode: true, next: ['O6', 'A1'] }, // Branch: outer or diagonal A
  O6: { id: 'O6', isBranchNode: false, next: ['O7'] },
  O7: { id: 'O7', isBranchNode: false, next: ['O8'] },
  O8: { id: 'O8', isBranchNode: false, next: ['O9'] },
  O9: { id: 'O9', isBranchNode: false, next: ['O10'] },
  O10: { id: 'O10', isBranchNode: true, next: ['O11', 'B1'] }, // Branch: outer or diagonal B
  O11: { id: 'O11', isBranchNode: false, next: ['O12'] },
  O12: { id: 'O12', isBranchNode: false, next: ['O13'] },
  O13: { id: 'O13', isBranchNode: false, next: ['O14'] },
  O14: { id: 'O14', isBranchNode: false, next: ['O15'] },
  O15: { id: 'O15', isBranchNode: false, next: ['O16'] }, // No branch here - must continue outer
  O16: { id: 'O16', isBranchNode: false, next: ['O17'] },
  O17: { id: 'O17', isBranchNode: false, next: ['O18'] },
  O18: { id: 'O18', isBranchNode: false, next: ['O19'] },
  O19: { id: 'O19', isBranchNode: false, next: ['O20'] },
  O20: { id: 'O20', isBranchNode: false, next: [] }, // End - next move finishes

  // Center node
  C: { id: 'C', isBranchNode: true, next: ['A3', 'B3'] }, // Branch: to O15 or O20

  // Diagonal A: O5 → A1 → A2 → C → A3 → A4 → O15
  A1: { id: 'A1', isBranchNode: false, next: ['A2'] },
  A2: { id: 'A2', isBranchNode: false, next: ['C'] },
  A3: { id: 'A3', isBranchNode: false, next: ['A4'] },
  A4: { id: 'A4', isBranchNode: false, next: ['O15'] },

  // Diagonal B: O10 → B1 → B2 → C → B3 → B4 → O20
  B1: { id: 'B1', isBranchNode: false, next: ['B2'] },
  B2: { id: 'B2', isBranchNode: false, next: ['C'] },
  B3: { id: 'B3', isBranchNode: false, next: ['B4'] },
  B4: { id: 'B4', isBranchNode: false, next: ['O20'] },
};

/**
 * Get available branch options from a node
 */
export function getBranchOptions(nodeId: NodeId): BranchOption[] {
  if (nodeId === 'O5') {
    return ['OUTER', 'DIAGONAL_A'];
  } else if (nodeId === 'O10') {
    return ['OUTER', 'DIAGONAL_B'];
  } else if (nodeId === 'C') {
    return ['TO_O15', 'TO_O20'];
  }
  return [];
}

/**
 * Get next node based on branch choice
 * Returns the first next node if not a branch, or the chosen branch node
 */
export function getNextNode(nodeId: NodeId, branchChoice?: BranchOption): NodeId | null {
  const node = BOARD_GRAPH[nodeId];
  if (!node) return null;

  if (node.next.length === 0) {
    return null; // O20 or finished
  }

  if (!node.isBranchNode) {
    return node.next[0];
  }

  // Handle branch nodes
  if (nodeId === 'O5') {
    return branchChoice === 'DIAGONAL_A' ? 'A1' : 'O6';
  } else if (nodeId === 'O10') {
    return branchChoice === 'DIAGONAL_B' ? 'B1' : 'O11';
  } else if (nodeId === 'C') {
    return branchChoice === 'TO_O20' ? 'B3' : 'A3';
  }

  return node.next[0];
}

/**
 * Traverse N steps from a starting node
 * Returns the final node after consuming all steps, or 'FINISHED' if the piece completes
 * Branch choice is only used for the first step if starting from a branch node
 */
export function traverseSteps(
  startNode: NodeId,
  steps: number,
  branchChoice?: BranchOption
): NodeId | 'FINISHED' {
  if (steps <= 0) return startNode;

  let current = startNode;
  let remainingSteps = steps;
  let firstStep = true;

  while (remainingSteps > 0) {
    // Check if we're at O20 - any move from here finishes
    if (current === 'O20') {
      return 'FINISHED';
    }

    // Get next node
    const next = firstStep
      ? getNextNode(current, branchChoice)
      : getNextNode(current);

    firstStep = false;

    if (next === null) {
      // Reached end (O20) - next step will finish
      return 'FINISHED';
    }

    current = next;
    remainingSteps--;
  }

  return current;
}

/**
 * Check if a node is a branch node where player must choose
 */
export function isBranchNode(nodeId: NodeId): boolean {
  return BOARD_GRAPH[nodeId]?.isBranchNode ?? false;
}

/**
 * Special node types for node events
 */
export type SpecialNodeType = 'NORMAL' | 'STICK' | 'REFRESH';

/**
 * Configuration for special node placement
 */
export interface SpecialNodeConfig {
  stickCount: number;      // Number of STICK nodes to place
  refreshCount: number;    // Number of REFRESH nodes to place
  excludedNodeIds: NodeId[]; // Nodes that cannot be special nodes
}

/**
 * Default special node configuration per MVP spec
 */
export const DEFAULT_SPECIAL_NODE_CONFIG: SpecialNodeConfig = {
  stickCount: 5,
  refreshCount: 2,
  excludedNodeIds: ['O0', 'O5', 'O10', 'C', 'O20'],
};

/**
 * Get all eligible nodes for special node placement
 * Excludes branch nodes, HOME (O0), and O20
 */
export function getEligibleNodes(excludedNodeIds: NodeId[] = DEFAULT_SPECIAL_NODE_CONFIG.excludedNodeIds): NodeId[] {
  const allNodeIds = Object.keys(BOARD_GRAPH);
  return allNodeIds.filter(nodeId => !excludedNodeIds.includes(nodeId));
}

/**
 * Create initial special node assignments
 * Returns a mapping of NodeId -> SpecialNodeType
 * 
 * @param config Optional configuration (defaults to DEFAULT_SPECIAL_NODE_CONFIG)
 * @param rng Optional RNG function for deterministic testing (defaults to Math.random)
 */
export function createInitialSpecialNodes(
  config: SpecialNodeConfig = DEFAULT_SPECIAL_NODE_CONFIG,
  rng: () => number = Math.random
): Record<NodeId, SpecialNodeType> {
  const eligibleNodes = getEligibleNodes(config.excludedNodeIds);
  const result: Record<NodeId, SpecialNodeType> = {};
  
  // Initialize all nodes as NORMAL
  for (const nodeId of Object.keys(BOARD_GRAPH)) {
    result[nodeId] = 'NORMAL';
  }

  // Ensure we have enough eligible nodes
  const totalSpecialNodes = config.stickCount + config.refreshCount;
  if (totalSpecialNodes > eligibleNodes.length) {
    throw new Error(
      `Not enough eligible nodes (${eligibleNodes.length}) for ${totalSpecialNodes} special nodes`
    );
  }

  // Shuffle eligible nodes using Fisher-Yates algorithm
  const shuffled = [...eligibleNodes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Assign STICK nodes
  for (let i = 0; i < config.stickCount; i++) {
    result[shuffled[i]] = 'STICK';
  }

  // Assign REFRESH nodes
  for (let i = config.stickCount; i < config.stickCount + config.refreshCount; i++) {
    result[shuffled[i]] = 'REFRESH';
  }

  return result;
}
