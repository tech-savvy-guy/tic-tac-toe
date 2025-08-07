"use client"

import type { Board, Player } from "@/types/game"

interface GameBoardProps {
  board: Board
  winningLine: number[] | null
  isGameActive: boolean
  isAiThinking: boolean
  currentPlayer: Player
  canMakeMove: boolean
  onCellClick: (index: number) => void
}

export function GameBoard({
  board,
  winningLine,
  isGameActive,
  isAiThinking,
  currentPlayer,
  canMakeMove,
  onCellClick,
}: GameBoardProps) {
  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-1 bg-muted/10 p-1">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`aspect-square bg-card flex items-center justify-center text-4xl font-extralight transition-all duration-200 hover:bg-muted/5 disabled:cursor-not-allowed focus:outline-none relative group ${
              winningLine?.includes(index) ? "bg-muted/5" : ""
            }`}
            onClick={() => onCellClick(index)}
            disabled={!isGameActive || isAiThinking || !canMakeMove}
          >
            {cell && (
              <span
                className={`${
                  cell === "X" ? "text-foreground" : "text-muted-foreground"
                } transition-all duration-300 animate-in zoom-in-50`}
              >
                {cell}
              </span>
            )}
            {!cell && !isGameActive === false && isGameActive && !isAiThinking && canMakeMove && (
              <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/10 text-4xl font-extralight opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {currentPlayer}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
