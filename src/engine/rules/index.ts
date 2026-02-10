/**
 * Movement Rules Module
 *
 * Implements game rules for piece movement:
 * - HOME spawning (O0 → O1+)
 * - Branch selection at O5, O10, C
 * - Move validation and simulation
 * - Stacking (automatic merge on landing)
 * - Finish detection (overshoot rule at O20)
 */

import type { NodeId, BranchOption } from '../board';
import { traverseSteps, isBranchNode, getBranchOptions } from '../board';
import type { GameState } from '../state';
import {
  spawnPieceFromHome,
  moveStack,
  finishStack,
  findStackAtPosition,
  mergeStacks,
  getHomePieces,
} from '../state';

export interface MoveResult {
  finalPosition: NodeId | 'FINISHED';
  isFinished: boolean;
  needsBranchChoice: boolean;
  availableBranches?: BranchOption[];
}

export interface MoveTarget {
  type: 'HOME' | 'STACK';
  stackId?: string; // Only for STACK type
}

/**
 * Validate if a move is possible
 * Returns information about what choices are needed
 */
export function validateMove(
  state: GameState,
  target: MoveTarget,
  steps: number
): MoveResult {
  // HOME spawning
  if (target.type === 'HOME') {
    const homePieces = getHomePieces(state);
    if (homePieces.length === 0) {
      throw new Error('No pieces at HOME to spawn');
    }

    const finalPos = traverseSteps('O0', steps);

    if (finalPos === 'FINISHED') {
      return {
        finalPosition: 'FINISHED',
        isFinished: true,
        needsBranchChoice: false,
      };
    }

    return {
      finalPosition: finalPos,
      isFinished: false,
      needsBranchChoice: false, // Spawning doesn't require branch choice at destination
    };
  }

  // Stack movement
  if (target.type === 'STACK') {
    if (!target.stackId) {
      throw new Error('Stack ID required for STACK move');
    }

    const stack = state.stacks.find((s) => s.id === target.stackId);
    if (!stack) {
      throw new Error('Stack not found');
    }

    const startPos = stack.position;

    // Check if starting from a branch node - player must choose
    if (isBranchNode(startPos)) {
      return {
        finalPosition: startPos, // Placeholder
        isFinished: false,
        needsBranchChoice: true,
        availableBranches: getBranchOptions(startPos),
      };
    }

    // Non-branch move
    const finalPos = traverseSteps(startPos, steps);

    if (finalPos === 'FINISHED') {
      return {
        finalPosition: 'FINISHED',
        isFinished: true,
        needsBranchChoice: false,
      };
    }

    return {
      finalPosition: finalPos,
      isFinished: false,
      needsBranchChoice: false,
    };
  }

  throw new Error('Invalid move target type');
}

/**
 * Execute a move with a branch choice (if needed)
 * Returns the updated game state
 */
export function executeMove(
  state: GameState,
  target: MoveTarget,
  steps: number,
  branchChoice?: BranchOption
): GameState {
  // HOME spawning
  if (target.type === 'HOME') {
    const finalPos = traverseSteps('O0', steps, branchChoice);

    if (finalPos === 'FINISHED') {
      // Spawn and immediately finish (very rare: 모 from O0 might do this in theory)
      let newState = spawnPieceFromHome(state, 'O20');
      const spawnedStack = newState.stacks[newState.stacks.length - 1];
      newState = finishStack(newState, spawnedStack.id);
      return newState;
    }

    // Spawn at final position
    let newState = spawnPieceFromHome(state, finalPos);

    // Check for auto-merge
    const spawnedStack = newState.stacks[newState.stacks.length - 1];
    const existingStack = findStackAtPosition(
      { ...newState, stacks: newState.stacks.filter((s) => s.id !== spawnedStack.id) },
      finalPos
    );

    if (existingStack) {
      newState = mergeStacks(newState, existingStack.id, spawnedStack.id);
    }

    return newState;
  }

  // Stack movement
  if (target.type === 'STACK') {
    if (!target.stackId) {
      throw new Error('Stack ID required for STACK move');
    }

    const stack = state.stacks.find((s) => s.id === target.stackId);
    if (!stack) {
      throw new Error('Stack not found');
    }

    const startPos = stack.position;
    const finalPos = traverseSteps(startPos, steps, branchChoice);

    if (finalPos === 'FINISHED') {
      return finishStack(state, stack.id);
    }

    // Move stack to final position
    let newState = moveStack(state, stack.id, finalPos);

    // Check for auto-merge
    const movedStack = newState.stacks.find((s) => s.id === stack.id);
    if (!movedStack) {
      throw new Error('Moved stack not found');
    }

    const existingStack = findStackAtPosition(
      { ...newState, stacks: newState.stacks.filter((s) => s.id !== stack.id) },
      finalPos
    );

    if (existingStack) {
      newState = mergeStacks(newState, existingStack.id, movedStack.id);
    }

    return newState;
  }

  throw new Error('Invalid move target type');
}

/**
 * Get all valid move targets for the current state
 */
export function getValidMoveTargets(state: GameState): MoveTarget[] {
  const targets: MoveTarget[] = [];

  // HOME is always a valid target if there are pieces there
  if (getHomePieces(state).length > 0) {
    targets.push({ type: 'HOME' });
  }

  // All stacks on the board are valid targets
  for (const stack of state.stacks) {
    targets.push({ type: 'STACK', stackId: stack.id });
  }

  return targets;
}
