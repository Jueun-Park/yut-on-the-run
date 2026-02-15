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
  const { selectedNode, selectableNodes, destinationNodes, selectNode } = useGameState();

  return (
    <div className="w-full h-full">
      <BoardSvg
        selectedNode={selectedNode}
        selectableNodes={selectableNodes}
        destinationNodes={destinationNodes}
        onNodeClick={selectNode}
      />
    </div>
  );
}
