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

interface BoardProps {
  // Selection and interaction state
  selectedNode: NodeId | null;
  selectableNodes: NodeId[];
  destinationNodes: NodeId[];
  onNodeClick?: (nodeId: NodeId) => void;
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
      </svg>
    </div>
  );
}
