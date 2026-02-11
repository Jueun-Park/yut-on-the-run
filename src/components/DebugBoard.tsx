/**
 * Debug Board Component (Temporary)
 * 
 * Simple board visualization for MVP development.
 * Renders all nodes as clickable buttons to enable gameplay testing.
 * Will be replaced with proper SVG board in future milestone.
 */

import { Button } from "@/components/ui/button"
import type { GameState, Stack } from "@/engine/state"
import type { NodeId } from "@/engine/board"
import { BOARD_GRAPH } from "@/engine/board"

interface DebugBoardProps {
  gameState: GameState;
  highlightedNodes?: Set<NodeId>;
  selectableStacks?: Set<string>;
  onNodeClick?: (nodeId: NodeId) => void;
  onStackClick?: (stackId: string) => void;
  onHomeClick?: () => void;
}

export function DebugBoard({ 
  gameState, 
  highlightedNodes = new Set(),
  selectableStacks = new Set(),
  onNodeClick,
  onStackClick,
  onHomeClick
}: DebugBoardProps) {
  // Group nodes by type for organized display
  const outerNodes = Object.keys(BOARD_GRAPH).filter(id => id.startsWith('O'))
  const diagonalANodes = Object.keys(BOARD_GRAPH).filter(id => id.startsWith('A'))
  const diagonalBNodes = Object.keys(BOARD_GRAPH).filter(id => id.startsWith('B'))
  const centerNode = 'C'

  const getStackAtNode = (nodeId: NodeId): Stack | undefined => {
    return gameState.stacks.find(s => s.position === nodeId)
  }

  const homePiecesCount = gameState.pieces.filter(p => p.state === 'HOME').length
  const finishedPiecesCount = gameState.pieces.filter(p => p.state === 'FINISHED').length

  const renderNode = (nodeId: NodeId) => {
    const stack = getStackAtNode(nodeId)
    const isHighlighted = highlightedNodes.has(nodeId)
    const isSelectable = stack && selectableStacks.has(stack.id)

    const handleClick = () => {
      if (stack && onStackClick) {
        onStackClick(stack.id)
      } else if (onNodeClick) {
        onNodeClick(nodeId)
      }
    }

    return (
      <Button
        key={nodeId}
        variant={isHighlighted ? "default" : isSelectable ? "outline" : "ghost"}
        size="sm"
        onClick={handleClick}
        className={`min-w-[60px] ${isHighlighted ? 'ring-2 ring-primary' : ''}`}
      >
        <div className="text-center">
          <div className="text-xs font-mono">{nodeId}</div>
          {stack && (
            <div className="text-xs font-bold text-primary">
              [{stack.pieceIds.length}]
            </div>
          )}
        </div>
      </Button>
    )
  }

  return (
    <div className="w-full space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="text-center text-sm font-semibold text-muted-foreground">
        Debug Board (Temporary)
      </div>

      {/* HOME and FINISHED areas */}
      <div className="flex justify-between gap-2">
        <Button
          variant={onHomeClick ? "outline" : "ghost"}
          onClick={onHomeClick}
          className="flex-1"
        >
          <div className="text-center">
            <div className="text-xs">HOME</div>
            <div className="text-sm font-bold">{homePiecesCount}</div>
          </div>
        </Button>
        <Button variant="ghost" className="flex-1" disabled>
          <div className="text-center">
            <div className="text-xs">FINISHED</div>
            <div className="text-sm font-bold">{finishedPiecesCount}</div>
          </div>
        </Button>
      </div>

      {/* Outer path */}
      <div>
        <div className="text-xs text-muted-foreground mb-1">Outer Path:</div>
        <div className="flex flex-wrap gap-1">
          {outerNodes.map(renderNode)}
        </div>
      </div>

      {/* Diagonal A */}
      <div>
        <div className="text-xs text-muted-foreground mb-1">Diagonal A (O5 → O15):</div>
        <div className="flex flex-wrap gap-1">
          {diagonalANodes.map(renderNode)}
        </div>
      </div>

      {/* Diagonal B */}
      <div>
        <div className="text-xs text-muted-foreground mb-1">Diagonal B (O10 → O20):</div>
        <div className="flex flex-wrap gap-1">
          {diagonalBNodes.map(renderNode)}
        </div>
      </div>

      {/* Center */}
      <div>
        <div className="text-xs text-muted-foreground mb-1">Center:</div>
        {renderNode(centerNode)}
      </div>
    </div>
  )
}
