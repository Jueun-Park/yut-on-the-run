/**
 * Reward Modal Component
 * 
 * Displays artifact selection modal after piece finishes:
 * - Shows N artifact candidates (based on stack size)
 * - Allows selection of one artifact
 * - Closes and returns to PLAY phase after selection
 */

import { Button } from "@/components/ui/button"
import type { Artifact } from '../engine/rewards';

interface RewardModalProps {
  candidates: Artifact[];
  onSelect: (artifact: Artifact) => void;
}

export function RewardModal({ candidates, onSelect }: RewardModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">🎉 Reward!</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A piece has finished! Choose one artifact:
        </p>
        <div className="space-y-2">
          {candidates.map((artifact) => (
            <Button
              key={artifact.id}
              variant="outline"
              onClick={() => onSelect(artifact)}
              className="w-full h-auto py-3 px-4 text-left flex flex-col items-start gap-1"
            >
              <div className="font-semibold">{artifact.name}</div>
              <div className="text-xs text-muted-foreground">{artifact.description}</div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
