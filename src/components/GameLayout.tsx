import { useState } from "react"
import { Settings } from "./Settings"
import { ThrowPhase } from "./ThrowPhase"
import { PlayPhase } from "./PlayPhase"
import { RewardModal } from "./RewardModal"
import { GameOver } from "./GameOver"
import { GamePhase, initializeGameState, type GameState } from "@/engine/state"

export function GameLayout() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGameState())

  const handleNewGame = (seed: string) => {
    setGameState(initializeGameState(seed))
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
            {/* Board area - square placeholder */}
            <div className="w-full max-w-md aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center mb-4">
              <p className="text-muted-foreground text-center px-4">
                Game board placeholder
              </p>
            </div>
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
                onThrow={() => {}}
                onStartMove={() => {}}
              />
            )}
            {gameState.phase === GamePhase.PLAY && (
              <PlayPhase
                hand={gameState.hand}
                onSelectToken={() => {}}
              />
            )}
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {gameState.phase === GamePhase.REWARD && gameState.pendingReward && (
        <RewardModal
          candidates={gameState.pendingReward.candidates}
          onSelect={() => {}}
        />
      )}
    </div>
  )
}
