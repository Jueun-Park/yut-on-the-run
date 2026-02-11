/**
 * Node Event Handling Module
 *
 * Manages special node events (STICK and REFRESH) that trigger when pieces land on nodes.
 * Events trigger ONLY on landing (final destination), not when passing through.
 */

import type { NodeId, SpecialNodeType } from '../board';
import type { GameState } from '../state';
import { offerStick, updateSpecialNodes } from '../state';
import { drawRandomStick } from '../content/sticks';
import { createInitialSpecialNodes } from '../board';
import type { RngFunction } from '../rng';

/**
 * Check if a node has a special type that triggers events
 */
export function hasSpecialNodeEvent(
  state: GameState,
  nodeId: NodeId
): boolean {
  const nodeType = state.specialNodes[nodeId];
  return nodeType === 'STICK' || nodeType === 'REFRESH';
}

/**
 * Get the special node type at a position
 */
export function getSpecialNodeType(
  state: GameState,
  nodeId: NodeId
): SpecialNodeType {
  return state.specialNodes[nodeId] ?? 'NORMAL';
}

/**
 * Handle STICK node event - offer a random stick to the player
 * @param state Current game state
 * @param rng Random number generator (defaults to Math.random)
 * @returns Updated game state with pending stick offer
 */
export function handleStickNodeEvent(
  state: GameState,
  rng: RngFunction = Math.random
): GameState {
  const stick = drawRandomStick(rng);
  return offerStick(state, stick);
}

/**
 * Handle REFRESH node event - re-randomize special node placement
 * Uses the same config as the current special nodes mapping
 * @param state Current game state
 * @param rng Random number generator (defaults to Math.random)
 * @returns Updated game state with new special nodes mapping
 */
export function handleRefreshNodeEvent(
  state: GameState,
  rng: RngFunction = Math.random
): GameState {
  // Count current special nodes to maintain same configuration
  const currentNodes = Object.values(state.specialNodes);
  const stickCount = currentNodes.filter((type) => type === 'STICK').length;
  const refreshCount = currentNodes.filter((type) => type === 'REFRESH').length;

  // Get excluded nodes from current mapping (nodes that were never assigned special types)
  // For simplicity, we'll use the default exclusion list
  // In a full implementation, this could be configurable or stored in state
  const config = {
    stickCount,
    refreshCount,
    excludedNodeIds: ['O0', 'O5', 'O10', 'C', 'O20'],
  };

  const newSpecialNodes = createInitialSpecialNodes(config, rng);
  return updateSpecialNodes(state, newSpecialNodes);
}

/**
 * Handle node event based on the special node type
 * @param state Current game state
 * @param nodeId Node where piece landed
 * @param rng Random number generator (defaults to Math.random)
 * @returns Updated game state after handling event, or original state if no event
 */
export function handleNodeEvent(
  state: GameState,
  nodeId: NodeId,
  rng: RngFunction = Math.random
): GameState {
  const nodeType = getSpecialNodeType(state, nodeId);

  switch (nodeType) {
    case 'STICK':
      return handleStickNodeEvent(state, rng);
    case 'REFRESH':
      return handleRefreshNodeEvent(state, rng);
    case 'NORMAL':
    default:
      return state;
  }
}

/**
 * Check if a piece movement should trigger a node event
 * Events trigger only when:
 * 1. The piece lands on the node (final destination)
 * 2. The node has a special type (STICK or REFRESH)
 * 
 * Events do NOT trigger when:
 * - Passing through a node during multi-step movement
 * - A piece was already on the node before REFRESH changed it
 * 
 * @param _finalNodeId The node where the piece landed (final destination) - not used in current implementation
 * @param isLanding True if this is the final landing node, false if passing through
 * @returns True if event should trigger
 */
export function shouldTriggerNodeEvent(
  _finalNodeId: NodeId,
  isLanding: boolean
): boolean {
  // Events only trigger on landing, not pass-through
  return isLanding;
}
