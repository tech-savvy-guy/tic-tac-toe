"use client"

import { useState, useEffect, useCallback } from "react"

import { MenuScreen } from "@/components/menu-screen"
import { GameScreen } from "@/components/game-screen"
import { OnlineGameService } from "@/services/online-game"
import { makeAIMove, checkWinner } from "@/utils/game-logic"
import { OnlineSetupScreen } from "@/components/online-setup-screen"
import { WaitingRoomScreen } from "@/components/waiting-room-screen"
import type { GameMode, Board, Player, GameState, OnlineState, Room } from "@/types/game"

export default function TicTacToe() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    isGameActive: true,
    winningLine: null,
    isAiThinking: false,
  })

  const [gameMode, setGameMode] = useState<GameMode>("menu")

  // Online state
  const [onlineState, setOnlineState] = useState<OnlineState>({
    mode: "create",
    roomCode: "",
    joinCode: "",
    playerName: "",
    room: null,
    playerId: "",  // Initialize empty, will set in useEffect
    playerSymbol: null,
    opponentConnected: false,
    opponentDisconnected: false,
    connectionStatus: "disconnected",
  })

  const [onlineService] = useState(() => new OnlineGameService())

  // Initialize player ID and name on mount
  useEffect(() => {
    let storedId = localStorage.getItem("tic-tac-toe-player-id")
    if (!storedId) {
      storedId = crypto.randomUUID()
      localStorage.setItem("tic-tac-toe-player-id", storedId)
    }
    
    const storedName = localStorage.getItem("tic-tac-toe-player-name") || ""
    
    setOnlineState(prev => ({ 
      ...prev, 
      playerId: storedId!,
      playerName: storedName
    }))
  }, [])

  // Handle opponent disconnection
  const handleOpponentDisconnect = useCallback(() => {
    setOnlineState((prev) => {
      // Only set disconnected if we were actually playing
      if (prev.mode === "playing" && prev.opponentConnected) {
        return {
          ...prev,
          opponentDisconnected: true,
          opponentConnected: false,
        }
      }
      return prev
    })
    // Game state is preserved automatically - we don't clear it
  }, [])

  // Handle opponent reconnection
  const handleOpponentReconnect = useCallback(() => {
    setOnlineState((prev) => ({
      ...prev,
      opponentDisconnected: false,
      opponentConnected: true,
    }))
  }, [])

  // Handle room updates from Supabase
  const handleRoomUpdate = useCallback((updatedRoom: Room) => {
    setOnlineState((prev) => {
      const newState = { ...prev, room: updatedRoom }

      // Check if second player joined and we're the host waiting
      if (updatedRoom.status === "playing" && prev.mode === "waiting" && updatedRoom.player2_id) {
        newState.mode = "playing"
        newState.opponentConnected = true
        newState.opponentDisconnected = false
      }

      // If opponent reconnected (room has both players again)
      if (updatedRoom.status === "playing" && prev.opponentDisconnected && updatedRoom.player1_id && updatedRoom.player2_id) {
        newState.opponentDisconnected = false
        newState.opponentConnected = true
      }

      return newState
    })

    if (updatedRoom.board) {
      // Convert string array from database to Player array for game logic
      const convertedBoard: Board = updatedRoom.board.map(cell => {
        if (cell === "X") return "X"
        if (cell === "O") return "O" 
        return null
      })

      const isReset = convertedBoard.every(cell => cell === null)
      const gameResult = checkWinner(convertedBoard)

      setGameState((prev) => ({
        ...prev,
        board: convertedBoard,
        currentPlayer: updatedRoom.current_player,
        winner: isReset ? null : (updatedRoom.winner as Player | "tie" | null),
        isGameActive: isReset ? true : !updatedRoom.winner,
        winningLine: isReset ? null : (gameResult.winner ? gameResult.line : prev.winningLine)
      }))
    }
  }, []) // Remove the dependency on onlineState.mode

  // Handle connection status changes
  const handleConnectionStatusChange = useCallback((status: string) => {
    setOnlineState((prev) => ({
      ...prev,
      connectionStatus: status === "SUBSCRIBED" ? "connected" : "disconnected",
    }))
  }, [])

  // Create room
  const createRoom = async () => {
    if (!onlineState.playerName.trim()) return

    setOnlineState((prev) => ({ ...prev, connectionStatus: "connecting" }))

    try {
      const room = await onlineService.createRoom(onlineState.playerId, onlineState.playerName)

      setOnlineState((prev) => ({
        ...prev,
        roomCode: room.id,
        room,
        playerSymbol: "X",
        mode: "waiting",
      }))

      // Subscribe to room updates
      onlineService.subscribeToRoom(
        room.id, 
        handleRoomUpdate, 
        handleConnectionStatusChange,
        onlineState.playerId,
        handleOpponentDisconnect,
        handleOpponentReconnect
      )

      console.log("Room created and subscribed:", room.id) // Debug log
    } catch (error) {
      console.error("Error creating room:", error)
      setOnlineState((prev) => ({ ...prev, connectionStatus: "disconnected" }))
    }
  }

  // Join room
  const joinRoom = async () => {
    if (!onlineState.playerName.trim() || !onlineState.joinCode.trim()) return

    setOnlineState((prev) => ({ ...prev, connectionStatus: "connecting" }))

    try {
      const room = await onlineService.joinRoom(onlineState.joinCode, onlineState.playerId, onlineState.playerName)

      // Determine player symbol based on which player they are
      const isPlayer1 = room.player1_id === onlineState.playerId
      const playerSymbol: Player = isPlayer1 ? "X" : "O"
      const opponentConnected = !!(room.player1_id && room.player2_id)

      setOnlineState((prev) => ({
        ...prev,
        roomCode: onlineState.joinCode.toUpperCase(),
        room,
        playerSymbol,
        mode: room.status === "playing" ? "playing" : "waiting",
        opponentConnected,
        opponentDisconnected: false,
      }))

      onlineService.subscribeToRoom(
        room.id, 
        handleRoomUpdate, 
        handleConnectionStatusChange,
        onlineState.playerId,
        handleOpponentDisconnect,
        handleOpponentReconnect
      )

      // Immediately sync game state with the joined room
      handleRoomUpdate(room)
    } catch (error) {
      console.error("Error joining room:", error)
      alert(error instanceof Error ? error.message : "Failed to join room")
      setOnlineState((prev) => ({ ...prev, connectionStatus: "disconnected" }))
    }
  }

  // Make online move
  const makeOnlineMove = async (index: number) => {
    // Don't allow moves if opponent is disconnected
    if (!onlineState.room || !onlineState.playerSymbol || gameState.currentPlayer !== onlineState.playerSymbol || onlineState.opponentDisconnected) return

    const newBoard = [...gameState.board]
    newBoard[index] = onlineState.playerSymbol

    try {
      await onlineService.makeMove(onlineState.room.id, newBoard, onlineState.playerSymbol)
    } catch (error) {
      console.error("Error making move:", error)
    }
  }

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (gameState.board[index] || gameState.winner || !gameState.isGameActive) return

    if (gameMode === "online") {
      makeOnlineMove(index)
      return
    }

    // Local game logic
    if (gameState.isAiThinking) return

    const newBoard = [...gameState.board]
    newBoard[index] = gameState.currentPlayer

    const gameResult = checkWinner(newBoard)
    if (gameResult.winner) {
      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        winner: gameResult.winner,
        winningLine: gameResult.line,
        isGameActive: false,
      }))
      return
    }

    if (gameMode === "single" && gameState.currentPlayer === "X") {
      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        currentPlayer: "O",
        isAiThinking: true,
      }))
    } else if (gameMode === "local") {
      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
      }))
    }
  }

  // AI move effect
  useEffect(() => {
    if (
      gameMode === "single" &&
      gameState.currentPlayer === "O" &&
      gameState.isGameActive &&
      !gameState.winner &&
      gameState.isAiThinking
    ) {
      const timer = setTimeout(() => {
        const aiMove = makeAIMove(gameState.board)
        const newBoard = [...gameState.board]
        newBoard[aiMove] = "O"

        const gameResult = checkWinner(newBoard)
        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          currentPlayer: gameResult.winner ? "O" : "X",
          winner: gameResult.winner,
          winningLine: gameResult.line,
          isGameActive: !gameResult.winner,
          isAiThinking: false,
        }))
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [gameMode, gameState])

  // Reset game
  const resetGame = async () => {
    if (gameMode === "online" && onlineState.room) {
      try {
        // For online mode, just reset the game and let the server handle player alternation
        await onlineService.resetGame(onlineState.room.id)
      } catch (error) {
        console.error("Error resetting game:", error)
      }
    } else {
      // For local and single player modes, toggle the starting player
      const nextFirstPlayer = gameState.currentPlayer === "X" ? "O" : "X"
      setGameState({
        board: Array(9).fill(null),
        currentPlayer: nextFirstPlayer,
        winner: null,
        isGameActive: true,
        winningLine: null,
        isAiThinking: gameMode === "single" && nextFirstPlayer === "O", // Start AI thinking if AI goes first
      })
    }
  }

  // Back to menu
  const backToMenu = () => {
    onlineService.unsubscribe()

    setGameState({
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null,
      isGameActive: true,
      winningLine: null,
      isAiThinking: false,
    })

    // Preserve playerName from localStorage when going back to menu
    const storedName = localStorage.getItem("tic-tac-toe-player-name") || ""

    setOnlineState({
      mode: "create",
      roomCode: "",
      joinCode: "",
      playerName: storedName,
      room: null,
      playerId: onlineState.playerId || crypto.randomUUID(),
      playerSymbol: null,
      opponentConnected: false,
      opponentDisconnected: false,
      connectionStatus: "disconnected",
    })

    setGameMode("menu")
  }

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(onlineState.roomCode)
  }

  // Render appropriate screen
  const renderScreen = () => {
    if (gameMode === "menu") {
      return <MenuScreen onModeSelect={setGameMode} />
    }

    if (gameMode === "online") {
      if (onlineState.mode === "create" || onlineState.mode === "join") {
      return (
        <OnlineSetupScreen
          onlineMode={onlineState.mode}
          setOnlineMode={(mode) => setOnlineState((prev) => ({ ...prev, mode }))}
          playerName={onlineState.playerName}
          setPlayerName={(name) => {
            setOnlineState((prev) => ({ ...prev, playerName: name }))
            localStorage.setItem("tic-tac-toe-player-name", name)
          }}
          joinCode={onlineState.joinCode}
          setJoinCode={(code) => setOnlineState((prev) => ({ ...prev, joinCode: code }))}
          connectionStatus={onlineState.connectionStatus}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onBack={backToMenu}
        />
      )
    }

    if (onlineState.mode === "waiting") {
      return (
        <WaitingRoomScreen
          roomCode={onlineState.roomCode}
          connectionStatus={onlineState.connectionStatus}
          onBack={backToMenu}
          onCopyRoomCode={copyRoomCode}
        />
      )
    }
  }

    return (
      <GameScreen
        gameMode={gameMode}
        gameState={gameState}
        onlineState={onlineState}
        onBack={backToMenu}
        onReset={resetGame}
        onCellClick={handleCellClick}
      />
    )
  }

  return (
    <div className="relative">
      {renderScreen()}
    </div>
  )
}
