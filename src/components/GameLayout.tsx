import { Settings } from "./Settings"

export function GameLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-md flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">yut-on-the-run</h1>
          <Settings />
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Board area - square placeholder */}
        <div className="w-full max-w-md aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center mb-4">
          <p className="text-muted-foreground text-center px-4">
            Game board placeholder
          </p>
        </div>
      </main>

      {/* Action tray */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-md px-4 py-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <p className="text-muted-foreground">Action tray placeholder</p>
          </div>
        </div>
      </div>
    </div>
  )
}
