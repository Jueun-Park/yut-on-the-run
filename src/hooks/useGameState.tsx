/**
 * Game State Hook
 * 
 * Provides game state management and phase control for the UI.
 * This is a minimal implementation to support the board UI scaffolding.
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { GameState, GamePhase } from '@/engine/state';
import { initializeGameState } from '@/engine/state';
import type { NodeId } from '@/engine/board';

interface GameStateContextType {
  gameState: GameState;
  // Selection state for board interaction
  selectedNode: NodeId | null;
  selectableNodes: NodeId[];
  destinationNodes: NodeId[];
  // Actions
  selectNode: (nodeId: NodeId) => void;
  resetSelection: () => void;
  // Phase transitions (stubs for now)
  startMovePhase: () => void;
  selectHandToken: () => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  // Initialize game state
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState());
  
  // Board interaction state
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [selectableNodes, setSelectableNodes] = useState<NodeId[]>([]);
  const [destinationNodes, setDestinationNodes] = useState<NodeId[]>([]);

  const selectNode = (nodeId: NodeId) => {
    // Minimal implementation - just track selection
    setSelectedNode(nodeId);
  };

  const resetSelection = () => {
    setSelectedNode(null);
    setSelectableNodes([]);
    setDestinationNodes([]);
  };

  const startMovePhase = () => {
    // Stub: transition to PLAY phase
    setGameState(prev => ({
      ...prev,
      phase: 'PLAY' as GamePhase,
    }));
  };

  const selectHandToken = () => {
    // Stub: mark a token as selected and show valid destinations
    // For now, just show all nodes as selectable for testing
    // TODO: Accept token index parameter when implementing full gameplay
    setSelectableNodes(['O1', 'O5', 'O10', 'C']);
  };

  return (
    <GameStateContext.Provider
      value={{
        gameState,
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

