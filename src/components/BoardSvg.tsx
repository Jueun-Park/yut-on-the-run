/**
 * SVG Board Component
 * 
 * Renders the yut board using SVG with:
 * - Connection lines derived from BOARD_GRAPH edges
 * - Nodes with visible and invisible hit areas
 * - Support for selection and highlighting
 * - Minimal aesthetic
 */

import { BOARD_GRAPH, type NodeId } from '@/engine/board';
import { NODE_COORDINATES, VISUAL_CONSTANTS } from './BoardCoordinates';
import type { Stack, Piece } from '@/engine/state';

interface BoardProps {
  // Selection and interaction state
  selectedNode: NodeId | null;
  selectableNodes: NodeId[];
  destinationNodes: NodeId[];
  onNodeClick?: (nodeId: NodeId) => void;
  // Game state for rendering pieces
  stacks?: Stack[];
  pieces?: Piece[];
}

/**
 * Get all edges from BOARD_GRAPH for rendering
 */
function getBoardEdges(): Array<{ from: NodeId; to: NodeId }> {
  const edges: Array<{ from: NodeId; to: NodeId }> = [];
  
  for (const [fromId, node] of Object.entries(BOARD_GRAPH)) {
    // Skip O0 (HOME) as it's not rendered on board
    if (fromId === 'O0') continue;
    
    for (const toId of node.next) {
      edges.push({ from: fromId, to: toId });
    }
  }
  
  return edges;
}

export function Board({
  selectedNode,
  selectableNodes,
  destinationNodes,
  onNodeClick,
  stacks = [],
  pieces = [],
}: BoardProps) {
  const edges = getBoardEdges();
  const { VIEWBOX_SIZE, NODE_RADIUS_NORMAL, NODE_RADIUS_EMPHASIZED, HIT_RADIUS, LINE_WIDTH } = VISUAL_CONSTANTS;

  const handleNodeClick = (nodeId: NodeId) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  const isSelectable = (nodeId: NodeId) => selectableNodes.includes(nodeId);
  const isSelected = (nodeId: NodeId) => nodeId === selectedNode;
  const isDestination = (nodeId: NodeId) => destinationNodes.includes(nodeId);
  
  // Get stack at a given position
  const getStackAtNode = (nodeId: NodeId) => {
    return stacks.find(s => s.position === nodeId);
  };
  
  // Count finished and home pieces
  const finishedCount = pieces.filter(p => p.state === 'FINISHED').length;
  const homeCount = pieces.filter(p => p.state === 'HOME').length;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="w-full h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        {/* Connection lines - draw first so they appear behind nodes */}
        <g className="connections">
          {edges.map(({ from, to }, index) => {
            const fromCoord = NODE_COORDINATES[from];
            const toCoord = NODE_COORDINATES[to];
            
            if (!fromCoord || !toCoord) return null;

            return (
              <line
                key={`${from}-${to}-${index}`}
                x1={fromCoord.x}
                y1={fromCoord.y}
                x2={toCoord.x}
                y2={toCoord.y}
                stroke="currentColor"
                strokeWidth={LINE_WIDTH}
                className="text-muted-foreground/30"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {Object.entries(NODE_COORDINATES).map(([nodeId, coord]) => {
            // Skip O0 (HOME) - not rendered on board
            if (nodeId === 'O0') return null;

            const radius = coord.emphasized ? NODE_RADIUS_EMPHASIZED : NODE_RADIUS_NORMAL;
            const selectable = isSelectable(nodeId);
            const selected = isSelected(nodeId);
            const destination = isDestination(nodeId);

            // Determine node color based on state
            let nodeClass = 'text-foreground';
            if (selected) {
              nodeClass = 'text-blue-500';
            } else if (destination) {
              nodeClass = 'text-green-500';
            } else if (selectable) {
              nodeClass = 'text-yellow-500';
            }

            return (
              <g key={nodeId} className={nodeClass}>
                {/* Invisible hit area for touch targets */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={HIT_RADIUS}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => handleNodeClick(nodeId)}
                  pointerEvents="all"
                />
                
                {/* Visible node circle */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={radius}
                  fill="currentColor"
                  className="pointer-events-none"
                />

                {/* Optional: Node label for debugging */}
                <text
                  x={coord.x}
                  y={coord.y - radius - 8}
                  fontSize="12"
                  textAnchor="middle"
                  fill="currentColor"
                  className="pointer-events-none text-muted-foreground text-xs"
                >
                  {nodeId}
                </text>
              </g>
            );
          })}
        </g>

        {/* Pieces/Stacks */}
        <g className="pieces">
          {stacks.map((stack) => {
            const coord = NODE_COORDINATES[stack.position];
            if (!coord) return null;

            const pieceCount = stack.pieceIds.length;
            const pieceRadius = 8; // Smaller than node radius
            
            // Determine piece color - highlight if selectable
            const stackSelectable = isSelectable(stack.position);
            const pieceClass = stackSelectable ? 'text-amber-400' : 'text-primary';

            return (
              <g key={stack.id} className={pieceClass}>
                {/* Piece circle */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={pieceRadius}
                  fill="currentColor"
                  className="pointer-events-none"
                />
                
                {/* Stack count badge (if 2+ pieces) */}
                {pieceCount > 1 && (
                  <>
                    {/* Badge background */}
                    <circle
                      cx={coord.x + pieceRadius - 2}
                      cy={coord.y - pieceRadius + 2}
                      r={6}
                      fill="white"
                      className="pointer-events-none"
                    />
                    {/* Badge number */}
                    <text
                      x={coord.x + pieceRadius - 2}
                      y={coord.y - pieceRadius + 2}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="black"
                      className="pointer-events-none"
                    >
                      {pieceCount}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>
        
        {/* FINISHED area - 4 slots at bottom of board */}
        <g className="finished-area">
          {[0, 1, 2, 3].map((slotIndex) => {
            const slotX = VIEWBOX_SIZE / 2 - 60 + slotIndex * 40;
            const slotY = VIEWBOX_SIZE - 50;
            const filled = slotIndex < finishedCount;
            
            return (
              <g key={`finished-${slotIndex}`}>
                {/* Slot outline */}
                <circle
                  cx={slotX}
                  cy={slotY}
                  r={12}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground"
                />
                
                {/* Filled piece */}
                {filled && (
                  <circle
                    cx={slotX}
                    cy={slotY}
                    r={8}
                    fill="currentColor"
                    className="text-green-500"
                  />
                )}
              </g>
            );
          })}
          
          {/* FINISHED label */}
          <text
            x={VIEWBOX_SIZE / 2}
            y={VIEWBOX_SIZE - 20}
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            fill="currentColor"
            className="text-muted-foreground"
          >
            FINISHED
          </text>
        </g>
        
        {/* HOME area - top right corner */}
        <g className="home-area">
          <text
            x={VIEWBOX_SIZE - 80}
            y={30}
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            fill="currentColor"
            className="text-muted-foreground"
          >
            HOME: {homeCount}
          </text>
        </g>
      </svg>
    </div>
  );
}
