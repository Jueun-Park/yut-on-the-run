/**
 * Board Coordinates Module
 * 
 * Defines the coordinate system for rendering the yut board.
 * Uses a normalized viewBox of 0-1000 for responsive scaling.
 * 
 * Layout:
 * - O1 is positioned at bottom-right
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
const OUTER_RADIUS = 400;
const DIAGONAL_INNER_RADIUS = 200;
const DIAGONAL_MIDDLE_RADIUS = 300;

/**
 * Calculate position on outer ring
 * O1 is at bottom-right (approximately 315 degrees or -45 degrees)
 * Numbers increase counter-clockwise
 */
function getOuterRingPosition(nodeNumber: number): { x: number; y: number } {
  // O1 starts at -45 degrees (bottom-right), counter-clockwise
  // 20 nodes, so 360/20 = 18 degrees per node
  const anglePerNode = 18;
  const startAngle = -45; // Bottom-right
  const angle = (startAngle + (nodeNumber - 1) * anglePerNode) * (Math.PI / 180);
  
  return {
    x: CENTER_X + OUTER_RADIUS * Math.cos(angle),
    y: CENTER_Y + OUTER_RADIUS * Math.sin(angle),
  };
}

/**
 * Calculate position on diagonal path
 */
function getDiagonalPosition(
  startAngle: number,
  distance: 'inner' | 'middle'
): { x: number; y: number } {
  const radius = distance === 'inner' ? DIAGONAL_INNER_RADIUS : DIAGONAL_MIDDLE_RADIUS;
  const angle = startAngle * (Math.PI / 180);
  
  return {
    x: CENTER_X + radius * Math.cos(angle),
    y: CENTER_Y + radius * Math.sin(angle),
  };
}

/**
 * All node coordinates with emphasis markers
 */
export const NODE_COORDINATES: Record<NodeId, NodeCoordinate> = {
  // Outer ring O1-O20
  O1: { ...getOuterRingPosition(1), emphasized: false },
  O2: { ...getOuterRingPosition(2), emphasized: false },
  O3: { ...getOuterRingPosition(3), emphasized: false },
  O4: { ...getOuterRingPosition(4), emphasized: false },
  O5: { ...getOuterRingPosition(5), emphasized: true }, // Branch node
  O6: { ...getOuterRingPosition(6), emphasized: false },
  O7: { ...getOuterRingPosition(7), emphasized: false },
  O8: { ...getOuterRingPosition(8), emphasized: false },
  O9: { ...getOuterRingPosition(9), emphasized: false },
  O10: { ...getOuterRingPosition(10), emphasized: true }, // Branch node
  O11: { ...getOuterRingPosition(11), emphasized: false },
  O12: { ...getOuterRingPosition(12), emphasized: false },
  O13: { ...getOuterRingPosition(13), emphasized: false },
  O14: { ...getOuterRingPosition(14), emphasized: false },
  O15: { ...getOuterRingPosition(15), emphasized: true }, // Junction node
  O16: { ...getOuterRingPosition(16), emphasized: false },
  O17: { ...getOuterRingPosition(17), emphasized: false },
  O18: { ...getOuterRingPosition(18), emphasized: false },
  O19: { ...getOuterRingPosition(19), emphasized: false },
  O20: { ...getOuterRingPosition(20), emphasized: true }, // End node
  
  // Center
  C: { x: CENTER_X, y: CENTER_Y, emphasized: true },
  
  // Diagonal A: O5 (45°) → A1 → A2 → C → A3 → A4 → O15 (135°)
  A1: { ...getDiagonalPosition(45, 'middle'), emphasized: false },
  A2: { ...getDiagonalPosition(45, 'inner'), emphasized: false },
  A3: { ...getDiagonalPosition(135, 'inner'), emphasized: false },
  A4: { ...getDiagonalPosition(135, 'middle'), emphasized: false },
  
  // Diagonal B: O10 (135°) → B1 → B2 → C → B3 → B4 → O20 (225°)
  B1: { ...getDiagonalPosition(135, 'middle'), emphasized: false },
  B2: { ...getDiagonalPosition(135, 'inner'), emphasized: false },
  B3: { ...getDiagonalPosition(225, 'inner'), emphasized: false },
  B4: { ...getDiagonalPosition(225, 'middle'), emphasized: false },
  
  // O0 (HOME) is not rendered on the board
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
