/**
 * Game State Hook
 * 
 * Provides game state management and phase control for the UI.
 * Uses React useReducer + Context for centralized state management.
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { GameState } from '@/engine/state';
import { initializeGameState } from '@/engine/state';
import { gameReducer, type GameAction } from '@/engine/state/reducer';
import type { NodeId } from '@/engine/board';

interface GameStateContextType {
  gameState: GameState;
  dispatch: Dispatch<GameAction>;
  // Selection state for board interaction (derived from gameState)
  selectedNode: NodeId | null;
  selectableNodes: NodeId[];
  destinationNodes: NodeId[];
  // Actions (convenience methods that dispatch actions)
  selectNode: (nodeId: NodeId) => void;
  resetSelection: () => void;
  // Phase transitions (stubs for now)
  startMovePhase: () => void;
  selectHandToken: () => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  // Initialize game state with reducer
  const [gameState, dispatch] = useReducer(gameReducer, undefined, () => initializeGameState());
  
  // Derived selection state (not in reducer to keep UI concerns separate)
  // These would be computed from gameState in a full implementation
  const selectedNode = gameState.selectedNodeId ?? null;
  const selectableNodes: NodeId[] = []; // TODO: compute from game state
  const destinationNodes: NodeId[] = []; // TODO: compute from game state

  const selectNode = (nodeId: NodeId) => {
    dispatch({ type: 'SET_SELECTED_NODE', nodeId });
  };

  const resetSelection = () => {
    dispatch({ type: 'SET_SELECTED_NODE', nodeId: undefined });
    dispatch({ type: 'SET_SELECTED_TOKEN', tokenIndex: undefined });
  };

  const startMovePhase = () => {
    dispatch({ type: 'SET_PHASE', phase: 'PLAY' });
  };

  const selectHandToken = () => {
    // Stub: mark a token as selected and show valid destinations
    // TODO: Accept token index parameter when implementing full gameplay
    // TODO: Calculate actual valid destinations based on game state
    // For now, this is just a placeholder
  };

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        dispatch,
        selectedNode,
        selectableNodes,
        destinationNodes,
        selectNode,
        resetSelection,
        startMovePhase,
        selectHandToken,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within GameStateProvider');
  }
  return context;
}

export function useGameDispatch() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameDispatch must be used within GameStateProvider');
  }
  return context.dispatch;
}

