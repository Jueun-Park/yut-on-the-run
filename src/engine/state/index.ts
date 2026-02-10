/**
 * Turn State Machine Module
 * 
 * Manages game state and phase transitions:
 * - Phases: THROW, PLAY, REWARD, GAME_OVER
 * - Turn counter
 * - Hand tokens (accumulated throw results)
 * - Throws remaining counter
 * - Piece/stack positions
 * 
 * TODO: Define game state types and interfaces
 * TODO: Implement state transition logic
 * TODO: Implement game over detection (4 pieces finished)
 * TODO: Implement turn counter management
 */

export const GamePhase = {
  THROW: 'THROW',
  PLAY: 'PLAY',
  REWARD: 'REWARD',
  GAME_OVER: 'GAME_OVER',
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

export const PieceState = {
  HOME: 'HOME',
  ON_BOARD: 'ON_BOARD',
  FINISHED: 'FINISHED',
} as const;

export type PieceState = typeof PieceState[keyof typeof PieceState];

export type YutResult = 'DO' | 'GAE' | 'GEOL' | 'YUT' | 'MO';

export interface HandToken {
  result: YutResult;
  steps: number;
}

export interface GameState {
  phase: GamePhase;
  turn: number;
  throwsRemaining: number;
  hand: HandToken[];
  // TODO: Add piece/stack state
  // TODO: Add board state
  // TODO: Add collected artifacts
}

// TODO: Export state initialization function
// TODO: Export state transition functions
// TODO: Export state validation utilities
