import type { Board, Player } from "@/types/game"
import { WINNING_COMBINATIONS } from "@/constants/game"

export const checkWinner = (board: Board): { winner: Player | "tie" | null; line: number[] | null } => {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combination }
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { winner: "tie", line: null }
  }

  return { winner: null, line: null }
}

export const makeAIMove = (board: Board): number => {
  // Check if AI can win
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board]
      testBoard[i] = "O"
      if (checkWinner(testBoard).winner === "O") {
        return i
      }
    }
  }

  // Check if AI needs to block player
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board]
      testBoard[i] = "X"
      if (checkWinner(testBoard).winner === "X") {
        return i
      }
    }
  }

  // Take center if available
  if (board[4] === null) return 4

  // Take corners
  const corners = [0, 2, 6, 8]
  const availableCorners = corners.filter((i) => board[i] === null)
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)]
  }

  // Take any available space
  const availableSpaces = board.map((cell, index) => (cell === null ? index : null)).filter((val) => val !== null)
  return availableSpaces[Math.floor(Math.random() * availableSpaces.length)] as number
}

export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
