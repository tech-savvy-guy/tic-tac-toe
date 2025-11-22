"use client"

import { ArrowLeft, RotateCcw, Wifi, WifiOff } from "lucide-react"
import { GameBoard } from "./game-board"
import type { GameMode, GameState, OnlineState } from "@/types/game"

interface GameScreenProps {
  gameMode: GameMode
  gameState: GameState
  onlineState: OnlineState
  onBack: () => void
  onReset: () => void
  onCellClick: (index: number) => void
}

export function GameScreen({ gameMode, gameState, onlineState, onBack, onReset, onCellClick }: GameScreenProps) {
  const { board, currentPlayer, winner, isGameActive, winningLine, isAiThinking } = gameState
  const { room, playerSymbol, connectionStatus, roomCode } = onlineState

  const getOpponentName = () => {
    if (!room) return ""
    return room.player1_id === onlineState.playerId ? room.player2_name : room.player1_name
  }

  const getGameTitle = () => {
    switch (gameMode) {
      case "single":
        return "vs AI"
      case "local":
        return "LOCAL"
      case "online":
        return `vs ${getOpponentName()}`
      default:
        return ""
    }
  }

  const getGameStatus = () => {
    if (winner === "tie") {
      return "DRAW"
    }
    if (winner) {
      switch (gameMode) {
        case "single":
          return winner === "X" ? "YOU WIN" : "AI WINS"
        case "online":
          return winner === playerSymbol ? "YOU WIN" : "YOU LOSE"
        default:
          return `${winner} WINS`
      }
    }

    if (isAiThinking) {
      return <span className="animate-pulse">AI THINKING...</span>
    }

    switch (gameMode) {
      case "single":
        return currentPlayer === "X" ? "YOUR TURN" : "AI TURN"
      case "online":
        return currentPlayer === playerSymbol ? "YOUR TURN" : "OPPONENT'S TURN"
      default:
        return `${currentPlayer} TURN`
    }
  }

  const canMakeMove = () => {
    if (gameMode === "online") {
      return currentPlayer === playerSymbol
    }
    return true
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 sm:p-8">
      <div className="w-full max-w-xs space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center select-none">
          <button onClick={onBack} className="p-2 hover:bg-muted/5 rounded-full transition-all duration-200 group">
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-sm font-light tracking-widest text-muted-foreground uppercase">{getGameTitle()}</h2>
            {gameMode === "online" && (
              <div className="flex items-center justify-center space-x-1 mt-1">
                {connectionStatus === "connected" ? (
                  <Wifi className="h-3 w-3 text-success" />
                ) : (
                  <WifiOff className="h-3 w-3 text-error" />
                )}
                <span className="text-xs text-muted-foreground/40">
                  {playerSymbol} • {roomCode}
                </span>
              </div>
            )}
          </div>
          {gameMode !== "online" ? (
            <button onClick={onReset} className="p-2 hover:bg-muted/5 rounded-full transition-all duration-200 group">
              <RotateCcw className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ) : (
            <div className="w-9 h-9"></div>
          )}
        </div>

        {/* Game Status */}
        <div className="text-center h-8 flex items-center justify-center select-none">
          <div className="text-muted-foreground/40 font-light tracking-wide">{getGameStatus()}</div>
        </div>

        {/* Game Board */}
        <GameBoard
          board={board}
          winningLine={winningLine}
          isGameActive={isGameActive}
          isAiThinking={isAiThinking}
          currentPlayer={currentPlayer}
          canMakeMove={canMakeMove()}
          onCellClick={onCellClick}
        />

        {/* Action Buttons */}
        {winner && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-500">
            {gameMode !== "online" && (
              <button
                onClick={onReset}
                className="w-full py-3 bg-foreground text-background font-light tracking-wide hover:bg-foreground/80 transition-all duration-200"
              >
                PLAY AGAIN
              </button>
            )}
            <button
              onClick={onBack}
              className="w-full py-3 text-foreground font-light tracking-wide hover:bg-muted/5 transition-all duration-200 border border-foreground"
            >
              MENU
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
