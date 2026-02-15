/**
 * Board Coordinates Module
 * 
 * Defines the coordinate system for rendering the yut board.
 * Uses a normalized viewBox of 0-1000 for responsive scaling.
 * 
 * Layout:
 * - Overall shape is a SQUARE (not a circle)
 * - O1 is positioned at bottom-right corner
 * - Outer ring numbers increase counter-clockwise from O1 to O20
 * - C is in the center
 * - Diagonals connect O5↔C↔O15 and O10↔C↔O20
 */

import type { NodeId } from '@/engine/board';

export interface NodeCoordinate {
  x: number;
  y: number;
  emphasized: boolean; // True for O5, O10, O15, O20, C
}

const CENTER_X = 500;
const CENTER_Y = 500;
const BOARD_SIZE = 800; // Square board dimension
const MARGIN = 100; // Margin from edges

/**
 * Calculate position on outer square ring
 * O1 is at bottom-right corner (starting position)
 * O20 is also at bottom-right corner (ending position, completing the loop)
 * Counter-clockwise flow: O1→O5 (right edge, up), O6→O10 (top edge, left), 
 *                         O11→O15 (left edge, down), O16→O20 (bottom edge, right)
 * 20 nodes total: 5 nodes per side
 */
function getOuterSquarePosition(nodeNumber: number): { x: number; y: number } {
  // Each side has 5 nodes (including corners)
  const nodesPerSide = 5;
  const spacing = BOARD_SIZE / (nodesPerSide - 1);
  
  let x: number, y: number;
  
  if (nodeNumber >= 1 && nodeNumber <= 5) {
    // Right edge: O1-O5 (bottom to top)
    // O1 at bottom-right corner, going up
    const pos = nodeNumber - 1;
    x = MARGIN + BOARD_SIZE;
    y = MARGIN + BOARD_SIZE - (pos * spacing);
  } else if (nodeNumber >= 6 && nodeNumber <= 10) {
    // Top edge: O6-O10 (right to left)
    const pos = nodeNumber - 6;
    x = MARGIN + BOARD_SIZE - (pos * spacing);
    y = MARGIN;
  } else if (nodeNumber >= 11 && nodeNumber <= 15) {
    // Left edge: O11-O15 (top to bottom)
    const pos = nodeNumber - 11;
    x = MARGIN;
    y = MARGIN + (pos * spacing);
  } else if (nodeNumber >= 16 && nodeNumber <= 20) {
    // Bottom edge: O16-O20 (left to right)
    // O20 ends at bottom-right corner
    const pos = nodeNumber - 16;
    x = MARGIN + (pos * spacing);
    y = MARGIN + BOARD_SIZE;
  } else {
    x = CENTER_X;
    y = CENTER_Y;
  }
  
  return { x, y };
}

/**
 * Get position for diagonal nodes
 * Diagonals run from corners through center
 */
function getDiagonalPosition(
  cornerNode: number,
  distance: 'inner' | 'middle'
): { x: number; y: number } {
  const cornerPos = getOuterSquarePosition(cornerNode);
  const distanceRatio = distance === 'inner' ? 0.33 : 0.67;
  
  // Interpolate between center and corner
  const x = CENTER_X + (cornerPos.x - CENTER_X) * distanceRatio;
  const y = CENTER_Y + (cornerPos.y - CENTER_Y) * distanceRatio;
  
  return { x, y };
}

/**
 * All node coordinates with emphasis markers
 */
export const NODE_COORDINATES: Record<NodeId, NodeCoordinate> = {
  // Outer ring O1-O20 (square layout, counter-clockwise from bottom-right)
  O1: { ...getOuterSquarePosition(1), emphasized: false },
  O2: { ...getOuterSquarePosition(2), emphasized: false },
  O3: { ...getOuterSquarePosition(3), emphasized: false },
  O4: { ...getOuterSquarePosition(4), emphasized: false },
  O5: { ...getOuterSquarePosition(5), emphasized: true }, // Branch node (top-right corner)
  O6: { ...getOuterSquarePosition(6), emphasized: false },
  O7: { ...getOuterSquarePosition(7), emphasized: false },
  O8: { ...getOuterSquarePosition(8), emphasized: false },
  O9: { ...getOuterSquarePosition(9), emphasized: false },
  O10: { ...getOuterSquarePosition(10), emphasized: true }, // Branch node (top-left corner)
  O11: { ...getOuterSquarePosition(11), emphasized: false },
  O12: { ...getOuterSquarePosition(12), emphasized: false },
  O13: { ...getOuterSquarePosition(13), emphasized: false },
  O14: { ...getOuterSquarePosition(14), emphasized: false },
  O15: { ...getOuterSquarePosition(15), emphasized: true }, // Junction node (bottom-left corner)
  O16: { ...getOuterSquarePosition(16), emphasized: false },
  O17: { ...getOuterSquarePosition(17), emphasized: false },
  O18: { ...getOuterSquarePosition(18), emphasized: false },
  O19: { ...getOuterSquarePosition(19), emphasized: false },
  O20: { ...getOuterSquarePosition(20), emphasized: true }, // End node (bottom-right corner)
  
  // Center
  C: { x: CENTER_X, y: CENTER_Y, emphasized: true },
  
  // Diagonal A: O5 → A1 → A2 → C → A3 → A4 → O15
  // O5 is at top-right corner, O15 is at bottom-left corner
  A1: { ...getDiagonalPosition(5, 'middle'), emphasized: false },
  A2: { ...getDiagonalPosition(5, 'inner'), emphasized: false },
  A3: { ...getDiagonalPosition(15, 'inner'), emphasized: false },
  A4: { ...getDiagonalPosition(15, 'middle'), emphasized: false },
  
  // Diagonal B: O10 → B1 → B2 → C → B3 → B4 → O20
  // O10 is at top-left corner, O20 is at bottom-right corner
  B1: { ...getDiagonalPosition(10, 'middle'), emphasized: false },
  B2: { ...getDiagonalPosition(10, 'inner'), emphasized: false },
  B3: { ...getDiagonalPosition(20, 'inner'), emphasized: false },
  B4: { ...getDiagonalPosition(20, 'middle'), emphasized: false },
  
  // O0 (HOME) is not rendered on the board - positioned off-screen
  // This is intentional: HOME is a logical position, not a visual board node
  O0: { x: -100, y: -100, emphasized: false },
};

/**
 * Visual styling constants
 */
export const VISUAL_CONSTANTS = {
  VIEWBOX_SIZE: 1000,
  NODE_RADIUS_NORMAL: 8,
  NODE_RADIUS_EMPHASIZED: 14,
  HIT_RADIUS: 22, // >= 44px diameter requirement
  LINE_WIDTH: 2,
  LINE_WIDTH_EMPHASIZED: 3,
};
