import { useState } from "react"
import { Settings } from "./Settings"
import { ThrowPhase } from "./ThrowPhase"
import { PlayPhase } from "./PlayPhase"
import { RewardModal } from "./RewardModal"
import { GameOver } from "./GameOver"
import { 
  GamePhase, 
  initializeGameState, 
  addHandToken, 
  transitionToPlay,
  removeHandToken,
  transitionToReward,
  completeReward,
  advanceTurn,
  isGameOver,
  type GameState,
  type Artifact 
} from "@/engine/state"
import { throwYut, grantsBonus } from "@/engine/rng"
import { executeMove, type MoveTarget } from "@/engine/rules"
import { calculateRewardChoices, generateArtifactCandidates } from "@/engine/rewards"
import type { BranchOption } from "@/engine/board"

export function GameLayout() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState())

  const handleNewGame = (seed: string) => {
    setGameState(initializeGameState(seed))
  }

  const handleThrow = () => {
    if (gameState.throwsRemaining <= 0) return;

    // Throw using the game's RNG
    const result = throwYut(gameState.stickInventory, () => gameState.rng.next())
    
    // Add token to hand
    let newState = addHandToken(gameState, result)
    
    // Handle bonus throws (YUT/MO grant +1 throw)
    if (grantsBonus(result.result)) {
      newState = {
        ...newState,
        throwsRemaining: newState.throwsRemaining, // Keep same, bonus throw
      }
    } else {
      // Decrement throws remaining
      newState = {
        ...newState,
        throwsRemaining: newState.throwsRemaining - 1,
      }
    }
    
    setGameState(newState)
  }

  const handleStartMove = () => {
    setGameState(transitionToPlay(gameState))
  }

  const handleExecuteMove = (tokenIndex: number, target: MoveTarget, branchChoice?: BranchOption) => {
    const token = gameState.hand[tokenIndex]
    if (!token) return

    // Execute the move
    let newState = executeMove(gameState, target, token.steps, branchChoice)
    
    // Remove the token from hand
    newState = removeHandToken(newState, tokenIndex)

    // Check if a piece finished (for reward)
    // Compare piece states before and after to detect finish
    const finishedPiecesAfter = newState.pieces.filter(p => p.state === 'FINISHED').length
    const finishedPiecesBefore = gameState.pieces.filter(p => p.state === 'FINISHED').length
    
    if (finishedPiecesAfter > finishedPiecesBefore) {
      // A piece finished! Trigger reward
      // Determine stack size that finished (for reward calculation)
      let stackSize = 1
      if (target.type === 'STACK') {
        const stack = gameState.stacks.find(s => s.id === target.stackId)
        if (stack) {
          stackSize = stack.pieceIds.length
        }
      }
      
      const rewardCount = calculateRewardChoices(stackSize)
      const candidates = generateArtifactCandidates(rewardCount, () => newState.rng.next())
      
      newState = transitionToReward(newState, stackSize, candidates)
    } else if (newState.hand.length === 0) {
      // No more tokens, advance turn
      if (!isGameOver(newState)) {
        newState = advanceTurn(newState)
      } else {
        newState = { ...newState, phase: GamePhase.GAME_OVER }
      }
    }
    
    setGameState(newState)
  }

  const handleRewardSelect = (artifact: Artifact) => {
    let newState = completeReward(gameState, artifact)
    setGameState(newState)
  }

  const phaseText = {
    [GamePhase.THROW]: "Throw Phase",
    [GamePhase.PLAY]: "Play Phase",
    [GamePhase.REWARD]: "Reward",
    [GamePhase.GAME_OVER]: "Game Over",
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-md flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">yut-on-the-run</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Turn {gameState.turn}</span>
              <span>•</span>
              <span>{phaseText[gameState.phase]}</span>
            </div>
          </div>
          <Settings onNewGame={handleNewGame} currentSeed={gameState.seed} />
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {gameState.phase === GamePhase.GAME_OVER ? (
          <GameOver />
        ) : (
          <>
            {/* Board area - will show in play phase */}
            {gameState.phase !== GamePhase.THROW && (
              <div className="w-full max-w-md mb-4">
                {/* Board is rendered in PlayPhase */}
              </div>
            )}
          </>
        )}
      </main>

      {/* Action tray */}
      {gameState.phase !== GamePhase.GAME_OVER && (
        <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto w-full max-w-md px-4 py-4">
            {gameState.phase === GamePhase.THROW && (
              <ThrowPhase
                throwsRemaining={gameState.throwsRemaining}
                hand={gameState.hand}
                onThrow={handleThrow}
                onStartMove={handleStartMove}
              />
            )}
            {gameState.phase === GamePhase.PLAY && (
              <PlayPhase
                gameState={gameState}
                onExecuteMove={handleExecuteMove}
              />
            )}
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {gameState.phase === GamePhase.REWARD && gameState.pendingReward && (
        <RewardModal
          candidates={gameState.pendingReward.candidates}
          onSelect={handleRewardSelect}
        />
      )}
    </div>
  )
}
