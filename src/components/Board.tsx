/**
 * Board Component
 * 
 * Visualizes the yut game board with SVG rendering:
 * - Outer path (O1-O20)
 * - Center node (C)
 * - Diagonal paths (A1-A4, B1-B4)
 * - Connection lines from BOARD_GRAPH edges
 * - Interactive nodes with touch targets
 */

import { useGameState } from '@/hooks/useGameState';
import { Board as BoardSvg } from './BoardSvg';

export function Board() {
  const { gameState, selectedNode, selectableNodes, destinationNodes, selectNode, selectMoveTarget } = useGameState();

  const handleNodeClick = (nodeId: string) => {
    // If in PLAY phase with a selected token, clicking a selectable node executes the move
    if (gameState.phase === 'PLAY' && gameState.selectedTokenIndex !== undefined) {
      // Find the stack at this node
      const stack = gameState.stacks.find(s => s.position === nodeId);
      if (stack) {
        selectMoveTarget({ type: 'STACK', stackId: stack.id });
        return;
      }
    }
    
    // Otherwise, just select the node
    selectNode(nodeId);
  };

  return (
    <div className="w-full h-full">
      <BoardSvg
        selectedNode={selectedNode}
        selectableNodes={selectableNodes}
        destinationNodes={destinationNodes}
        onNodeClick={handleNodeClick}
        stacks={gameState.stacks}
        pieces={gameState.pieces}
      />
    </div>
  );
}
