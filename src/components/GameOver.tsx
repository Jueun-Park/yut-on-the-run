/**
 * Game Over Component
 * 
 * Displays game completion screen:
 * - Completion message
 * - Total turn count
 * - Game summary (artifacts, statistics)
 * - Copy summary button
 * - New game button
 * 
 * TODO: Implement completion UI
 * TODO: Add summary statistics
 * TODO: Implement copy to clipboard
 * TODO: Add new game handler
 */

interface GameOverProps {
  turnCount: number;
  // TODO: Add more props for game statistics
  onNewGame: () => void;
}

export function GameOver({ turnCount, onNewGame }: GameOverProps) {
  // TODO: Implement game over screen
  // Placeholder to avoid unused variable warnings
  console.log({ onNewGame });
  
  return (
    <div>
      <h1>Game Complete!</h1>
      <p>Total turns: {turnCount}</p>
      {/* TODO: Display game summary */}
      {/* TODO: Add copy button */}
      {/* TODO: Add new game button */}
    </div>
  );
}
