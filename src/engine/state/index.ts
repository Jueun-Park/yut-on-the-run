/**
 * Turn State Machine Module
 *
 * Manages game state and phase transitions:
 * - Phases: THROW, PLAY, REWARD, GAME_OVER
 * - Turn counter
 * - Hand tokens (accumulated throw results)
 * - Throws remaining counter
 * - Piece/stack positions
 * - Stick inventory (4 slots)
 * - Special nodes and node events
 */

import type { NodeId, SpecialNodeType } from '../board';
import type { Stick } from '../content/sticks';
import { BASIC_STICK } from '../content/sticks';
import { normalizeSeed } from './seed';

export const GamePhase = {
  THROW: 'THROW',
  PLAY: 'PLAY',
  REWARD: 'REWARD',
  GAME_OVER: 'GAME_OVER',
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export const PieceState = {
  HOME: 'HOME',
  ON_BOARD: 'ON_BOARD',
  FINISHED: 'FINISHED',
} as const;

export type PieceState = (typeof PieceState)[keyof typeof PieceState];

export type YutResult = 'DO' | 'GAE' | 'GEOL' | 'YUT' | 'MO';

export interface HandToken {
  result: YutResult;
  steps: number;
}

export interface Piece {
  id: number; // 0, 1, 2, 3
  state: PieceState;
  position: NodeId | null; // null if HOME or FINISHED
}

export interface Stack {
  id: string; // Unique identifier
  pieceIds: number[]; // IDs of pieces in this stack
  position: NodeId; // Current position on board
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  seed: string; // Game seed for deterministic RNG
  throwsRemaining: number;
  hand: HandToken[];
  pieces: Piece[];
  stacks: Stack[]; // Stacks currently on the board
  artifacts: Artifact[]; // Collected artifacts
  // Stick inventory (4 slots)
  stickInventory: [Stick, Stick, Stick, Stick];
  // Special nodes mapping
  specialNodes: Record<NodeId, SpecialNodeType>;
  // UI selection state
  selectedNodeId?: NodeId;
  selectedTokenIndex?: number;
  // For reward phase
  pendingReward: {
    stackSize: number;
    candidates: Artifact[];
  } | null;
  // For STICK node events
  pendingStickOffer: {
    offeredStick: Stick;
  } | null;
}

/**
 * Initialize a new game state
 * @param seedOrSpecialNodes Optional seed string (will be normalized) or pre-initialized special nodes mapping (for backward compatibility)
 * @param specialNodes Optional pre-initialized special nodes mapping (only used if first arg is a string)
 */
export function initializeGameState(
  seedOrSpecialNodes?: string | Record<NodeId, SpecialNodeType>,
  specialNodes?: Record<NodeId, SpecialNodeType>
): GameState {
  // Handle backward compatibility: if first arg is an object, it's special nodes
  let seed = '';
  let nodes: Record<NodeId, SpecialNodeType> | undefined;
  
  if (typeof seedOrSpecialNodes === 'string') {
    seed = seedOrSpecialNodes;
    nodes = specialNodes;
  } else if (seedOrSpecialNodes === undefined) {
    seed = '';
    nodes = specialNodes;
  } else {
    // First arg is special nodes (old signature for backward compatibility)
    seed = '';
    nodes = seedOrSpecialNodes;
  }
  
  const normalizedSeed = normalizeSeed(seed);
  
  return {
    phase: GamePhase.THROW,
    turn: 1,
    seed: normalizedSeed,
    throwsRemaining: 1,
    hand: [],
    pieces: [
      { id: 0, state: PieceState.HOME, position: null },
      { id: 1, state: PieceState.HOME, position: null },
      { id: 2, state: PieceState.HOME, position: null },
      { id: 3, state: PieceState.HOME, position: null },
    ],
    stacks: [],
    artifacts: [],
    stickInventory: [BASIC_STICK, BASIC_STICK, BASIC_STICK, BASIC_STICK],
    specialNodes: nodes ?? {},
    pendingReward: null,
    pendingStickOffer: null,
  };
}

/**
 * Get pieces currently at HOME
 */
export function getHomePieces(state: GameState): Piece[] {
  return state.pieces.filter((p) => p.state === PieceState.HOME);
}

/**
 * Get finished pieces count
 */
export function getFinishedCount(state: GameState): number {
  return state.pieces.filter((p) => p.state === PieceState.FINISHED).length;
}

/**
 * Check if game is over (all 4 pieces finished)
 */
export function isGameOver(state: GameState): boolean {
  return getFinishedCount(state) === 4;
}

/**
 * Find stack at a given position
 */
export function findStackAtPosition(
  state: GameState,
  position: NodeId
): Stack | null {
  return state.stacks.find((s) => s.position === position) ?? null;
}

/**
 * Merge two stacks (when landing on occupied node)
 */
export function mergeStacks(state: GameState, stackId1: string, stackId2: string): GameState {
  const stack1 = state.stacks.find((s) => s.id === stackId1);
  const stack2 = state.stacks.find((s) => s.id === stackId2);

  if (!stack1 || !stack2) {
    throw new Error('Cannot merge: stack not found');
  }

  if (stack1.position !== stack2.position) {
    throw new Error('Cannot merge: stacks not at same position');
  }

  // Merge stack2 into stack1
  const mergedStack: Stack = {
    ...stack1,
    pieceIds: [...stack1.pieceIds, ...stack2.pieceIds],
  };

  return {
    ...state,
    stacks: state.stacks
      .filter((s) => s.id !== stackId2)
      .map((s) => (s.id === stackId1 ? mergedStack : s)),
  };
}

/**
 * Create a new stack from HOME (spawning first piece)
 */
export function spawnPieceFromHome(state: GameState, finalPosition: NodeId): GameState {
  const homePieces = getHomePieces(state);
  if (homePieces.length === 0) {
    throw new Error('No pieces at HOME to spawn');
  }

  const pieceToSpawn = homePieces[0]; // Always spawn the first HOME piece
  const newStackId = `stack-${Date.now()}-${Math.random()}`;

  const newStack: Stack = {
    id: newStackId,
    pieceIds: [pieceToSpawn.id],
    position: finalPosition,
  };

  const updatedPieces = state.pieces.map((p) =>
    p.id === pieceToSpawn.id
      ? { ...p, state: PieceState.ON_BOARD, position: finalPosition }
      : p
  );

  return {
    ...state,
    pieces: updatedPieces,
    stacks: [...state.stacks, newStack],
  };
}

/**
 * Move a stack to a new position
 */
export function moveStack(
  state: GameState,
  stackId: string,
  newPosition: NodeId
): GameState {
  const stack = state.stacks.find((s) => s.id === stackId);
  if (!stack) {
    throw new Error('Stack not found');
  }

  const updatedStack: Stack = {
    ...stack,
    position: newPosition,
  };

  const updatedPieces = state.pieces.map((p) =>
    stack.pieceIds.includes(p.id) ? { ...p, position: newPosition } : p
  );

  return {
    ...state,
    stacks: state.stacks.map((s) => (s.id === stackId ? updatedStack : s)),
    pieces: updatedPieces,
  };
}

/**
 * Finish a stack (remove from board, mark pieces as FINISHED)
 */
export function finishStack(state: GameState, stackId: string): GameState {
  const stack = state.stacks.find((s) => s.id === stackId);
  if (!stack) {
    throw new Error('Stack not found');
  }

  const updatedPieces = state.pieces.map((p) =>
    stack.pieceIds.includes(p.id)
      ? { ...p, state: PieceState.FINISHED, position: null }
      : p
  );

  return {
    ...state,
    stacks: state.stacks.filter((s) => s.id !== stackId),
    pieces: updatedPieces,
  };
}

/**
 * Add a hand token (from throw)
 */
export function addHandToken(state: GameState, token: HandToken): GameState {
  return {
    ...state,
    hand: [...state.hand, token],
  };
}

/**
 * Remove a hand token (after using it)
 */
export function removeHandToken(state: GameState, index: number): GameState {
  return {
    ...state,
    hand: state.hand.filter((_, i) => i !== index),
  };
}

/**
 * Transition to PLAY phase
 */
export function transitionToPlay(state: GameState): GameState {
  if (state.phase !== GamePhase.THROW) {
    throw new Error('Can only transition to PLAY from THROW phase');
  }
  return {
    ...state,
    phase: GamePhase.PLAY,
  };
}

/**
 * Transition to REWARD phase
 */
export function transitionToReward(
  state: GameState,
  stackSize: number,
  candidates: Artifact[]
): GameState {
  return {
    ...state,
    phase: GamePhase.REWARD,
    pendingReward: {
      stackSize,
      candidates,
    },
  };
}

/**
 * Complete reward selection and return to PLAY or advance turn
 */
export function completeReward(state: GameState, selectedArtifact: Artifact): GameState {
  if (state.phase !== GamePhase.REWARD) {
    throw new Error('Not in REWARD phase');
  }

  const updatedState: GameState = {
    ...state,
    artifacts: [...state.artifacts, selectedArtifact],
    pendingReward: null,
  };

  // Check if game is over
  if (isGameOver(updatedState)) {
    return {
      ...updatedState,
      phase: GamePhase.GAME_OVER,
    };
  }

  // If hand is empty, advance to next turn
  if (updatedState.hand.length === 0) {
    return {
      ...updatedState,
      phase: GamePhase.THROW,
      turn: updatedState.turn + 1,
      throwsRemaining: 1,
    };
  }

  // Otherwise, return to PLAY phase
  return {
    ...updatedState,
    phase: GamePhase.PLAY,
  };
}

/**
 * Advance to next turn (when hand is empty in PLAY phase)
 */
export function advanceTurn(state: GameState): GameState {
  if (state.hand.length > 0) {
    throw new Error('Cannot advance turn: hand is not empty');
  }

  return {
    ...state,
    phase: GamePhase.THROW,
    turn: state.turn + 1,
    throwsRemaining: 1,
  };
}

/**
 * Stick Inventory Management
 */

/**
 * Offer a stick to the player (triggered by STICK node)
 */
export function offerStick(state: GameState, stick: Stick): GameState {
  if (state.pendingStickOffer !== null) {
    throw new Error('Cannot offer stick: pending offer already exists');
  }

  return {
    ...state,
    pendingStickOffer: {
      offeredStick: stick,
    },
  };
}

/**
 * Replace a stick in the inventory with the offered stick
 * @param slotIndex Index (0-3) of the slot to replace
 */
export function replaceStickInInventory(
  state: GameState,
  slotIndex: number
): GameState {
  if (state.pendingStickOffer === null) {
    throw new Error('Cannot replace stick: no pending offer');
  }

  if (slotIndex < 0 || slotIndex > 3) {
    throw new Error('Invalid slot index: must be 0-3');
  }

  const newInventory = [...state.stickInventory] as [Stick, Stick, Stick, Stick];
  newInventory[slotIndex] = state.pendingStickOffer.offeredStick;

  return {
    ...state,
    stickInventory: newInventory,
    pendingStickOffer: null,
  };
}

/**
 * Discard the offered stick (keep current inventory unchanged)
 */
export function discardStickOffer(state: GameState): GameState {
  if (state.pendingStickOffer === null) {
    throw new Error('Cannot discard stick: no pending offer');
  }

  return {
    ...state,
    pendingStickOffer: null,
  };
}

/**
 * Special Node Event Handling
 */

/**
 * Update special nodes mapping (used for REFRESH node effect)
 */
export function updateSpecialNodes(
  state: GameState,
  newSpecialNodes: Record<NodeId, SpecialNodeType>
): GameState {
  return {
    ...state,
    specialNodes: newSpecialNodes,
  };
}

// Re-export seed utilities
export { normalizeSeed, generateRandomSeed } from './seed';
