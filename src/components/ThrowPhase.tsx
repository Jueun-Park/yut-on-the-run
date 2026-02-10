/**
 * Throw Phase Component
 * 
 * Displays and handles the throw phase UI:
 * - Throws remaining counter
 * - Throw button (with RNG integration)
 * - Hand tokens display (accumulated results)
 * - Start Move button (when throwsRemaining === 0)
 * 
 * TODO: Implement throw button click handler
 * TODO: Integrate with RNG module
 * TODO: Display hand tokens visually
 * TODO: Handle phase transition to PLAY
 */

import type { HandToken } from '../engine/state';

interface ThrowPhaseProps {
  throwsRemaining: number;
  hand: HandToken[];
  onThrow: () => void;
  onStartMove: () => void;
}

export function ThrowPhase({ throwsRemaining, hand, onThrow, onStartMove }: ThrowPhaseProps) {
  // TODO: Implement component
  // Placeholder to avoid unused variable warnings
  console.log({ hand, onThrow, onStartMove });
  
  return (
    <div>
      <h2>Throw Phase</h2>
      <p>Throws remaining: {throwsRemaining}</p>
      {/* TODO: Add throw button */}
      {/* TODO: Display hand tokens */}
      {/* TODO: Add start move button */}
    </div>
  );
}
