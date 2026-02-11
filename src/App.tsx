import { ThemeProvider } from './components/theme-provider'
import { GameLayout } from './components/GameLayout'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="yut-theme">
      <GameLayout />
    </ThemeProvider>
  )
}

export default App
