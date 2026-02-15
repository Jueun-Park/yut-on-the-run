/**
 * Game Reducer Module
 * 
 * Defines game actions and reducer for state management with useReducer.
 */

import type { GameState, GamePhase, HandToken } from './index';
import { initializeGameState, isGameOver } from './index';
import type { NodeId } from '../board';
import type { BranchOption } from '../board';
import { executeMove, type MoveTarget } from '../rules';

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
  | { type: 'DECREMENT_THROWS_REMAINING' }
  | { type: 'INCREMENT_THROWS_REMAINING' }
  | { type: 'THROW_YUT'; token: HandToken }
  | { type: 'EXECUTE_MOVE'; tokenIndex: number; target: MoveTarget; branchChoice?: BranchOption };

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

    case 'INCREMENT_THROWS_REMAINING':
      return {
        ...state,
        throwsRemaining: state.throwsRemaining + 1,
      };

    case 'THROW_YUT': {
      // Add token to hand
      const newHand = [...state.hand, action.token];
      
      // Decrement throws remaining
      const newThrowsRemaining = Math.max(0, state.throwsRemaining - 1);
      
      // Check if result grants bonus throw (YUT or MO)
      const grantsBonus = action.token.result === 'YUT' || action.token.result === 'MO';
      
      return {
        ...state,
        hand: newHand,
        throwsRemaining: grantsBonus ? newThrowsRemaining + 1 : newThrowsRemaining,
      };
    }

    case 'EXECUTE_MOVE': {
      const { tokenIndex, target, branchChoice } = action;
      
      // Get the token to use
      if (tokenIndex < 0 || tokenIndex >= state.hand.length) {
        throw new Error('Invalid token index');
      }
      
      const token = state.hand[tokenIndex];
      
      // Execute the move using engine function
      let newState = executeMove(state, target, token.steps, branchChoice);
      
      // Remove used token from hand
      newState = {
        ...newState,
        hand: newState.hand.filter((_, i) => i !== tokenIndex),
        selectedTokenIndex: undefined,
        selectedNodeId: undefined,
      };
      
      // Check if all pieces are finished -> GAME_OVER
      if (isGameOver(newState)) {
        return {
          ...newState,
          phase: 'GAME_OVER',
        };
      }
      
      // If hand is empty, auto END_TURN
      if (newState.hand.length === 0) {
        return {
          ...newState,
          phase: 'THROW',
          turn: newState.turn + 1,
          throwsRemaining: 1,
        };
      }
      
      // Otherwise stay in PLAY phase
      return newState;
    }

    default:
      return state;
  }
}
