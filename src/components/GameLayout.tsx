import { Settings } from "./Settings"
import { Board } from "./Board"
import { useGameState } from "@/hooks/useGameState"
import { Button } from "@/components/ui/button"

export function GameLayout() {
  const { gameState, selectHandToken, startMovePhase } = useGameState();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-md flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-semibold whitespace-nowrap">yut-on-the-run</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <span className="whitespace-nowrap">Turn {gameState.turn}</span>
              <span className="text-xs truncate">Seed: {gameState.seed}</span>
            </div>
          </div>
          <Settings />
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Board area - square container */}
        <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden">
          <Board />
        </div>
      </main>

      {/* Action tray - phase dependent */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-md px-4 py-4">
          {/* THROW Phase */}
          {gameState.phase === 'THROW' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Throws remaining: {gameState.throwsRemaining}
                </span>
                <span className="text-sm text-muted-foreground">
                  Hand: {gameState.hand.length}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={gameState.throwsRemaining <= 0}
                >
                  Throw
                </Button>
                <Button
                  className="flex-1"
                  variant="secondary"
                  disabled={gameState.throwsRemaining > 0}
                  onClick={startMovePhase}
                >
                  Start Move
                </Button>
              </div>
            </div>
          )}

          {/* PLAY Phase */}
          {gameState.phase === 'PLAY' && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Select a token to use:
              </div>
              <div className="flex gap-2 flex-wrap">
                {gameState.hand.map((token, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => selectHandToken()}
                  >
                    {token.result} ({token.steps})
                  </Button>
                ))}
                {gameState.hand.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No tokens remaining
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REWARD Phase */}
          {gameState.phase === 'REWARD' && (
            <div className="text-center text-sm text-muted-foreground">
              Reward selection (modal)
            </div>
          )}

          {/* GAME_OVER Phase */}
          {gameState.phase === 'GAME_OVER' && (
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Game Over!</div>
              <div className="text-sm text-muted-foreground">
                Completed in {gameState.turn} turns
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
