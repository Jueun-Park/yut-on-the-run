import { ThemeProvider } from './components/theme-provider'
import { GameLayout } from './components/GameLayout'
import { GameStateProvider } from './hooks/useGameState'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="yut-theme">
      <GameStateProvider>
        <GameLayout />
      </GameStateProvider>
    </ThemeProvider>
  )
}

export default App
