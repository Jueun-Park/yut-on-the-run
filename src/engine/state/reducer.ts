/**
 * Game Reducer Module
 * 
 * Defines game actions and reducer for state management with useReducer.
 */

import type { GameState, GamePhase, HandToken } from './index';
import { initializeGameState } from './index';
import type { NodeId } from '../board';

/**
 * Game Action Types
 */
export type GameAction =
  | { type: 'NEW_GAME'; seed?: string }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'INCREMENT_TURN' }
  | { type: 'END_TURN' }
  | { type: 'SET_SELECTED_NODE'; nodeId: NodeId | undefined }
  | { type: 'SET_SELECTED_TOKEN'; tokenIndex: number | undefined }
  | { type: 'ADD_HAND_TOKEN'; token: HandToken }
  | { type: 'REMOVE_HAND_TOKEN'; index: number }
  | { type: 'SET_THROWS_REMAINING'; count: number }
  | { type: 'DECREMENT_THROWS_REMAINING' };

/**
 * Game Reducer
 * 
 * Handles all game state transitions based on dispatched actions.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return initializeGameState(action.seed || '');

    case 'SET_PHASE':
      return {
        ...state,
        phase: action.phase,
      };

    case 'INCREMENT_TURN':
      return {
        ...state,
        turn: state.turn + 1,
      };

    case 'END_TURN':
      return {
        ...state,
        phase: 'THROW',
        turn: state.turn + 1,
        throwsRemaining: 1,
        hand: [],
        selectedNodeId: undefined,
        selectedTokenIndex: undefined,
      };

    case 'SET_SELECTED_NODE':
      return {
        ...state,
        selectedNodeId: action.nodeId,
      };

    case 'SET_SELECTED_TOKEN':
      return {
        ...state,
        selectedTokenIndex: action.tokenIndex,
      };

    case 'ADD_HAND_TOKEN':
      return {
        ...state,
        hand: [...state.hand, action.token],
      };

    case 'REMOVE_HAND_TOKEN':
      return {
        ...state,
        hand: state.hand.filter((_, i) => i !== action.index),
      };

    case 'SET_THROWS_REMAINING':
      return {
        ...state,
        throwsRemaining: action.count,
      };

    case 'DECREMENT_THROWS_REMAINING':
      return {
        ...state,
        throwsRemaining: Math.max(0, state.throwsRemaining - 1),
      };

    default:
      return state;
  }
}
