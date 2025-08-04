"use client"

import type { GameMode } from "@/types/game"

interface MenuScreenProps {
  onModeSelect: (mode: GameMode) => void
}

export function MenuScreen({ onModeSelect }: MenuScreenProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-xs space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extralight tracking-wider text-black">TIC</h1>
          <div className="w-16 h-px bg-black mx-auto"></div>
          <h1 className="text-5xl font-extralight tracking-wider text-black">TAC</h1>
          <div className="w-16 h-px bg-black mx-auto"></div>
          <h1 className="text-5xl font-extralight tracking-wider text-black">TOE</h1>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onModeSelect("single")}
            className="w-full py-4 text-black font-light tracking-wide hover:bg-black hover:text-white transition-all duration-300 border border-black/20 hover:border-black group"
          >
            <span className="group-hover:tracking-wider transition-all duration-300">SINGLE PLAYER</span>
          </button>
          <button
            onClick={() => onModeSelect("local")}
            className="w-full py-4 text-black font-light tracking-wide hover:bg-black hover:text-white transition-all duration-300 border border-black/20 hover:border-black group"
          >
            <span className="group-hover:tracking-wider transition-all duration-300">LOCAL MULTIPLAYER</span>
          </button>
          <button
            onClick={() => onModeSelect("online")}
            className="w-full py-4 text-black font-light tracking-wide hover:bg-black hover:text-white transition-all duration-300 border border-black/20 hover:border-black group"
          >
            <span className="group-hover:tracking-wider transition-all duration-300">ONLINE MULTIPLAYER</span>
          </button>
        </div>
      </div>
    </div>
  )
}
