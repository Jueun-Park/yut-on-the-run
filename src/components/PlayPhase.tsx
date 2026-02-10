/**
 * Play Phase Component
 * 
 * Displays and handles the play phase UI:
 * - Hand tokens as selectable chips/buttons
 * - Stack/HOME target selection
 * - Branch selection modal (when needed)
 * - Move execution and board update
 * 
 * TODO: Implement token selection UI
 * TODO: Implement target selection flow
 * TODO: Implement branch selection modal
 * TODO: Integrate with movement rules
 */

import type { HandToken } from '../engine/state';

interface PlayPhaseProps {
  hand: HandToken[];
  onSelectToken: (token: HandToken) => void;
  // TODO: Add more props for game state
}

export function PlayPhase({ hand, onSelectToken }: PlayPhaseProps) {
  // TODO: Implement component
  // Placeholder to avoid unused variable warnings
  console.log({ hand, onSelectToken });
  
  return (
    <div>
      <h2>Play Phase</h2>
      {/* TODO: Display selectable hand tokens */}
      {/* TODO: Show board and selectable stacks */}
      {/* TODO: Show branch selection when needed */}
    </div>
  );
}
