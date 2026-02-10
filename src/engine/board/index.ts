/**
 * Board Graph Module
 * 
 * Defines the yut board structure with nodes and connections:
 * - Outer path: O0 (HOME) through O20
 * - Center node: C
 * - Diagonal A: O5 → A1 → A2 → C → A3 → A4 → O15
 * - Diagonal B: O10 → B1 → B2 → C → B3 → B4 → O20
 * 
 * TODO: Implement board node definitions
 * TODO: Implement path connections and graph structure
 * TODO: Implement path-finding utilities
 * TODO: Implement branch detection for O5, O10, and C nodes
 */

export type NodeId = string; // e.g., "O0", "O1", ..., "O20", "C", "A1", ..., "A4", "B1", ..., "B4"

export interface BoardNode {
  id: NodeId;
  // TODO: Add node properties (type, connections, etc.)
}

// TODO: Export board graph data structure
// TODO: Export utility functions for path traversal
