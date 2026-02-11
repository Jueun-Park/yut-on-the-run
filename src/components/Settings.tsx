import { Settings as SettingsIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"

interface SettingsProps {
  onNewGame?: (seed: string) => void;
  currentSeed?: string;
}

export function Settings({ onNewGame, currentSeed }: SettingsProps) {
  const { theme, setTheme } = useTheme()
  const [seedInput, setSeedInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 10) {
      setSeedInput(value)
    }
  }

  const handleNewGame = () => {
    if (onNewGame) {
      onNewGame(seedInput)
      setIsOpen(false)
      setSeedInput("")
    }
  }

  const remainingChars = 10 - seedInput.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your game preferences
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex flex-col gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="w-full justify-start"
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="w-full justify-start"
              >
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="w-full justify-start"
              >
                System
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seed-input">Game Seed (Optional)</Label>
            <Input
              id="seed-input"
              type="text"
              placeholder="Leave empty for random"
              value={seedInput}
              onChange={handleSeedChange}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              {remainingChars} character{remainingChars !== 1 ? 's' : ''} remaining
            </p>
            {currentSeed && (
              <p className="text-xs text-muted-foreground">
                Current seed: <span className="font-mono font-semibold">{currentSeed}</span>
              </p>
            )}
            <Button 
              onClick={handleNewGame} 
              className="w-full"
              disabled={!onNewGame}
            >
              Play New Game with Seed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
