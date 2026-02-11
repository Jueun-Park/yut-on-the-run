/**
 * Play Phase Component
 * 
 * Displays and handles the play phase UI:
 * - Hand tokens as selectable chips/buttons
 * - Stack/HOME target selection
 * - Branch selection modal (when needed)
 * - Move execution and board update
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { HandToken, GameState } from '../engine/state';
import type { MoveTarget } from '../engine/rules';
import type { BranchOption, NodeId } from '../engine/board';
import { DebugBoard } from './DebugBoard';

interface PlayPhaseProps {
  gameState: GameState;
  onExecuteMove: (tokenIndex: number, target: MoveTarget, branchChoice?: BranchOption) => void;
}

const TOKEN_LABELS = {
  DO: '도 (1)',
  GAE: '개 (2)',
  GEOL: '걸 (3)',
  YUT: '윷 (4)',
  MO: '모 (5)',
} as const;

type SelectionState = 
  | { stage: 'SELECT_TOKEN' }
  | { stage: 'SELECT_TARGET', tokenIndex: number, token: HandToken }
  | { stage: 'SELECT_BRANCH', tokenIndex: number, token: HandToken, target: MoveTarget, branches: BranchOption[] }
  | { stage: 'SELECT_DESTINATION', tokenIndex: number, token: HandToken, target: MoveTarget, validDestinations: Set<NodeId> };

export function PlayPhase({ gameState, onExecuteMove }: PlayPhaseProps) {
  const [selection, setSelection] = useState<SelectionState>({ stage: 'SELECT_TOKEN' });

  const handleTokenSelect = (index: number) => {
    const token = gameState.hand[index];
    setSelection({ stage: 'SELECT_TARGET', tokenIndex: index, token });
  };

  const handleHomeClick = () => {
    if (selection.stage !== 'SELECT_TARGET') return;
    
    // Check if HOME pieces exist
    const homePieces = gameState.pieces.filter(p => p.state === 'HOME');
    if (homePieces.length === 0) return;

    const target: MoveTarget = { type: 'HOME' };
    
    // Execute move immediately (no branching from HOME spawn in this simple version)
    onExecuteMove(selection.tokenIndex, target);
    setSelection({ stage: 'SELECT_TOKEN' });
  };

  const handleStackClick = (stackId: string) => {
    if (selection.stage !== 'SELECT_TARGET') return;
    
    const stack = gameState.stacks.find(s => s.id === stackId);
    if (!stack) return;

    const target: MoveTarget = { type: 'STACK', stackId };
    
    // Check if stack is on a branch node
    const isBranchNode = stack.position === 'O5' || stack.position === 'O10' || stack.position === 'C';
    
    if (isBranchNode) {
      // Need to select branch
      let branches: BranchOption[] = [];
      if (stack.position === 'O5') branches = ['OUTER', 'DIAGONAL_A'];
      else if (stack.position === 'O10') branches = ['OUTER', 'DIAGONAL_B'];
      else if (stack.position === 'C') branches = ['TO_O15', 'TO_O20'];
      
      setSelection({ stage: 'SELECT_BRANCH', tokenIndex: selection.tokenIndex, token: selection.token, target, branches });
    } else {
      // Execute move immediately
      onExecuteMove(selection.tokenIndex, target);
      setSelection({ stage: 'SELECT_TOKEN' });
    }
  };

  const handleBranchSelect = (branch: BranchOption) => {
    if (selection.stage !== 'SELECT_BRANCH') return;
    
    onExecuteMove(selection.tokenIndex, selection.target, branch);
    setSelection({ stage: 'SELECT_TOKEN' });
  };

  const handleCancel = () => {
    setSelection({ stage: 'SELECT_TOKEN' });
  };

  // Determine what to highlight on board
  const highlightedNodes = new Set<NodeId>();
  const selectableStacks = new Set<string>();

  if (selection.stage === 'SELECT_TARGET') {
    // Highlight all stacks that can move
    gameState.stacks.forEach(stack => {
      selectableStacks.add(stack.id);
    });
  }

  return (
    <div className="space-y-4">
      {/* Hand tokens */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Select a token:</p>
        <div className="flex flex-wrap gap-2">
          {gameState.hand.map((token, index) => (
            <Button
              key={index}
              variant={selection.stage !== 'SELECT_TOKEN' && 'tokenIndex' in selection && selection.tokenIndex === index ? "default" : "outline"}
              onClick={() => handleTokenSelect(index)}
              disabled={selection.stage !== 'SELECT_TOKEN'}
            >
              {TOKEN_LABELS[token.result]}
            </Button>
          ))}
        </div>
      </div>

      {/* Board */}
      {selection.stage === 'SELECT_TARGET' && (
        <>
          <p className="text-sm text-muted-foreground">Select a stack or HOME:</p>
          <DebugBoard
            gameState={gameState}
            highlightedNodes={highlightedNodes}
            selectableStacks={selectableStacks}
            onStackClick={handleStackClick}
            onHomeClick={handleHomeClick}
          />
          <Button variant="outline" onClick={handleCancel} className="w-full">
            Cancel
          </Button>
        </>
      )}

      {/* Branch selection */}
      {selection.stage === 'SELECT_BRANCH' && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Choose your path:</p>
          <div className="flex gap-2">
            {selection.branches.map((branch) => (
              <Button
                key={branch}
                onClick={() => handleBranchSelect(branch)}
                className="flex-1"
              >
                {branch === 'OUTER' && 'Outer Path'}
                {branch === 'DIAGONAL_A' && 'Diagonal A'}
                {branch === 'DIAGONAL_B' && 'Diagonal B'}
                {branch === 'TO_O15' && 'To O15'}
                {branch === 'TO_O20' && 'To O20'}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={handleCancel} className="w-full">
            Cancel
          </Button>
        </div>
      )}

      {selection.stage === 'SELECT_TOKEN' && gameState.hand.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          No tokens in hand. Turn will advance automatically.
        </p>
      )}
    </div>
  );
}
