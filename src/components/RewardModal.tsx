/**
 * Reward Modal Component
 * 
 * Displays artifact selection modal after piece finishes:
 * - Shows N artifact candidates (based on stack size)
 * - Allows selection of one artifact
 * - Closes and returns to PLAY phase after selection
 * 
 * TODO: Implement modal overlay
 * TODO: Display artifact candidates
 * TODO: Implement selection UI
 * TODO: Handle selection confirmation
 */

import type { Artifact } from '../engine/rewards';

interface RewardModalProps {
  artifacts: Artifact[];
  onSelect: (artifact: Artifact) => void;
  isOpen: boolean;
}

export function RewardModal({ artifacts, onSelect, isOpen }: RewardModalProps) {
  if (!isOpen) return null;

  // TODO: Implement modal UI
  // Placeholder to avoid unused variable warnings
  console.log({ artifacts, onSelect });
  
  return (
    <div>
      <h2>Reward Selection</h2>
      {/* TODO: Display artifact candidates */}
      {/* TODO: Add selection buttons */}
    </div>
  );
}
