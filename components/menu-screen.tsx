"use client"

import type { GameMode } from "@/types/game"

interface MenuScreenProps {
  onModeSelect: (mode: GameMode) => void
}

export function MenuScreen({ onModeSelect }: MenuScreenProps) {
  return (
    <div className="min-h-[90vh] bg-background flex items-center justify-center px-4 py-8 sm:p-8 select-none">
      <div className="w-full max-w-xs space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-wider text-foreground">TIC</h1>
          <div className="w-12 sm:w-16 h-px bg-foreground mx-auto"></div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-wider text-foreground">TAC</h1>
          <div className="w-12 sm:w-16 h-px bg-foreground mx-auto"></div>
          <h1 className="text-4xl sm:text-5xl font-extralight tracking-wider text-foreground">TOE</h1>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => onModeSelect("single")}
            className="w-full py-3 sm:py-4 text-sm sm:text-base text-foreground font-light tracking-wide hover:bg-foreground hover:text-background transition-all duration-300 border border-muted-foreground hover:border-foreground group"
          >
            <span className="group-hover:tracking-wider transition-all duration-300">SINGLE PLAYER</span>
          </button>
          <button
            onClick={() => onModeSelect("local")}
            className="w-full py-3 sm:py-4 text-sm sm:text-base text-foreground font-light tracking-wide hover:bg-foreground hover:text-background transition-all duration-300 border border-muted-foreground hover:border-foreground group"
          >
            <span className="group-hover:tracking-wider transition-all duration-300">LOCAL MULTIPLAYER</span>
          </button>
          <button
            onClick={() => onModeSelect("online")}
            className="w-full py-3 sm:py-4 text-sm sm:text-base text-foreground font-light tracking-wide hover:bg-foreground hover:text-background transition-all duration-300 border border-muted-foreground hover:border-foreground group"
          >
            <span className="group-hover:tracking-wider transition-all duration-300">ONLINE MULTIPLAYER</span>
          </button>
        </div>
      </div>
    </div>
  )
}
