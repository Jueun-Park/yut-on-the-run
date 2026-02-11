/**
 * Game Over Component
 * 
 * Displays game completion screen:
 * - Completion message
 * - Total turn count
 * - Game summary (artifacts, statistics)
 * - Copy summary button
 * - New game button
 */

export function GameOver() {
  // TODO: Accept props for game stats when ready
  // TODO: Implement game over screen with full details
  
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Game Complete!</h1>
      <p className="text-muted-foreground">All pieces have finished!</p>
      {/* TODO: Display game summary */}
      {/* TODO: Add copy button */}
      {/* TODO: Add new game button */}
    </div>
  );
}
