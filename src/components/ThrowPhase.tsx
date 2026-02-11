/**
 * Throw Phase Component
 * 
 * Displays and handles the throw phase UI:
 * - Throws remaining counter
 * - Throw button (with RNG integration)
 * - Hand tokens display (accumulated results)
 * - Start Move button (when throwsRemaining === 0)
 */

import { Button } from "@/components/ui/button"
import type { HandToken } from '../engine/state';

interface ThrowPhaseProps {
  throwsRemaining: number;
  hand: HandToken[];
  onThrow: () => void;
  onStartMove: () => void;
}

const TOKEN_LABELS = {
  DO: '도 (1)',
  GAE: '개 (2)',
  GEOL: '걸 (3)',
  YUT: '윷 (4)',
  MO: '모 (5)',
} as const;

export function ThrowPhase({ throwsRemaining, hand, onThrow, onStartMove }: ThrowPhaseProps) {
  const canStartMove = throwsRemaining === 0 && hand.length > 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Throws remaining: <span className="font-semibold">{throwsRemaining}</span>
        </p>
        <Button
          onClick={onThrow}
          disabled={throwsRemaining === 0}
          size="lg"
          className="w-full"
        >
          Throw Sticks
        </Button>
      </div>

      {hand.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Hand tokens:</p>
          <div className="flex flex-wrap gap-2">
            {hand.map((token, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-muted rounded-md text-sm font-medium"
              >
                {TOKEN_LABELS[token.result]}
              </div>
            ))}
          </div>
        </div>
      )}

      {canStartMove && (
        <Button
          onClick={onStartMove}
          variant="default"
          size="lg"
          className="w-full"
        >
          Start Move Phase
        </Button>
      )}
    </div>
  );
}
