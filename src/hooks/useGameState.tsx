/**
 * Game State Hook
 * 
 * Provides game state management and phase control for the UI.
 * Uses React useReducer + Context for centralized state management.
 */

/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useReducer, useMemo, type ReactNode, type Dispatch } from 'react';
import type { GameState } from '@/engine/state';
import { initializeGameState, getHomePieces } from '@/engine/state';
import { gameReducer, type GameAction } from '@/engine/state/reducer';
import type { NodeId } from '@/engine/board';
import type { BranchOption } from '@/engine/board';
import { validateMove, getValidMoveTargets, type MoveTarget } from '@/engine/rules';
import { throwYut, grantsBonus } from '@/engine/rng';

interface GameStateContextType {
  gameState: GameState;
  dispatch: Dispatch<GameAction>;
  // Selection state for board interaction (derived from gameState)
  selectedNode: NodeId | null;
  selectableNodes: NodeId[]; // Computed: valid move targets when token is selected
  destinationNodes: NodeId[]; // Computed: destination node when token + target selected
  // Actions (convenience methods that dispatch actions)
  selectNode: (nodeId: NodeId) => void;
  resetSelection: () => void;
  // Phase transitions
  startMovePhase: () => void;
  // Game actions
  performThrow: () => void;
  selectHandToken: (index: number) => void;
  selectMoveTarget: (target: MoveTarget, branchChoice?: BranchOption) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  // Initialize game state with reducer
  const [gameState, dispatch] = useReducer(gameReducer, undefined, () => initializeGameState());
  
  // Derived selection state (not in reducer to keep UI concerns separate)
  const selectedNode = gameState.selectedNodeId ?? null;
  
  // Compute selectable nodes: nodes where pieces/stacks can be selected to move
  const selectableNodes: NodeId[] = useMemo(() => {
    if (gameState.phase !== 'PLAY') return [];
    if (gameState.selectedTokenIndex === undefined) return [];
    
    // Get all valid move targets
    const targets = getValidMoveTargets(gameState);
    
    // Extract node IDs from stack targets
    const nodeIds: NodeId[] = [];
    for (const target of targets) {
      if (target.type === 'STACK' && target.stackId) {
        const stack = gameState.stacks.find(s => s.id === target.stackId);
        if (stack) {
          nodeIds.push(stack.position);
        }
      }
    }
    
    return nodeIds;
  }, [gameState]);
  
  // Compute destination nodes: where the selected piece will land
  const destinationNodes: NodeId[] = useMemo(() => {
    if (gameState.phase !== 'PLAY') return [];
    if (gameState.selectedTokenIndex === undefined) return [];
    if (!gameState.selectedNodeId) return [];
    
    const token = gameState.hand[gameState.selectedTokenIndex];
    if (!token) return [];
    
    // Find the target for the selected node
    let target: MoveTarget | undefined;
    
    // Check if it's a stack
    const stack = gameState.stacks.find(s => s.position === gameState.selectedNodeId);
    if (stack) {
      target = { type: 'STACK', stackId: stack.id };
    }
    
    if (!target) return [];
    
    try {
      const result = validateMove(gameState, target, token.steps);
      
      // If branch choice needed, we can't show destination yet
      if (result.needsBranchChoice) return [];
      
      // Return the destination node (if not finished)
      if (result.finalPosition !== 'FINISHED') {
        return [result.finalPosition];
      }
    } catch {
      // Invalid move, no destination
    }
    
    return [];
  }, [gameState]);

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

  const performThrow = () => {
    // Throw yut with current stick inventory
    const result = throwYut(gameState.stickInventory);
    
    // Dispatch THROW_YUT action (handles adding to hand, decrementing throws, bonus)
    dispatch({ type: 'THROW_YUT', token: result });
  };

  const selectHandToken = (index: number) => {
    // Set the selected token index
    dispatch({ type: 'SET_SELECTED_TOKEN', tokenIndex: index });
    
    // Clear selected node when changing token
    dispatch({ type: 'SET_SELECTED_NODE', nodeId: undefined });
  };

  const selectMoveTarget = (target: MoveTarget, branchChoice?: BranchOption) => {
    if (gameState.selectedTokenIndex === undefined) {
      console.warn('No token selected');
      return;
    }
    
    const token = gameState.hand[gameState.selectedTokenIndex];
    if (!token) {
      console.warn('Invalid token index');
      return;
    }
    
    // Check if branch choice is needed
    if (!branchChoice) {
      try {
        const result = validateMove(gameState, target, token.steps);
        if (result.needsBranchChoice) {
          // TODO: Show branch choice UI (for now, just log)
          console.warn('Branch choice needed but not provided', result.availableBranches);
          return;
        }
      } catch (error) {
        console.error('Invalid move:', error);
        return;
      }
    }
    
    // Execute the move
    dispatch({
      type: 'EXECUTE_MOVE',
      tokenIndex: gameState.selectedTokenIndex,
      target,
      branchChoice,
    });
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
        performThrow,
        selectHandToken,
        selectMoveTarget,
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

