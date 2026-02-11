/**
 * Reward Modal Component
 * 
 * Displays artifact selection modal after piece finishes:
 * - Shows N artifact candidates (based on stack size)
 * - Allows selection of one artifact
 * - Closes and returns to PLAY phase after selection
 */

import type { Artifact } from '../engine/rewards';

interface RewardModalProps {
  candidates: Artifact[];
  onSelect: (artifact: Artifact) => void;
}

export function RewardModal({ candidates, onSelect }: RewardModalProps) {
  // TODO: Implement modal UI with proper Dialog component
  // Placeholder to avoid unused variable warnings
  console.log({ candidates, onSelect });
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Reward Selection</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose one artifact as your reward:
        </p>
        {/* TODO: Display artifact candidates */}
        {/* TODO: Add selection buttons */}
      </div>
    </div>
  );
}
