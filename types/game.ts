export type Player = "X" | "O" | null
export type GameMode = "menu" | "single" | "local" | "online"
export type OnlineMode = "create" | "join" | "waiting" | "playing"
export type Board = Player[]
export type ConnectionStatus = "connected" | "disconnected" | "connecting"

export interface Room {
  id: string
  created_at: string
  player1_id: string | null
  player2_id: string | null
  player1_name: string | null
  player2_name: string | null
  current_player: "X" | "O"
  board: string[]
  winner: string | null
  status: "waiting" | "playing" | "finished"
}

export interface GameState {
  board: Board
  currentPlayer: Player
  winner: Player | "tie" | null
  isGameActive: boolean
  winningLine: number[] | null
  isAiThinking: boolean
}

export interface OnlineState {
  mode: OnlineMode
  roomCode: string
  joinCode: string
  playerName: string
  room: Room | null
  playerId: string
  playerSymbol: Player
  opponentConnected: boolean
  opponentDisconnected: boolean
  connectionStatus: ConnectionStatus
}
