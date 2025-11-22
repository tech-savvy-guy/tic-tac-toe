import { supabase } from "@/lib/supabase"
import type { Room, Board, Player } from "@/types/game"
import { generateRoomCode, checkWinner } from "@/utils/game-logic"
import type { RealtimeChannel } from "@supabase/supabase-js"

export class OnlineGameService {
  private channel: RealtimeChannel | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null

  async createRoom(playerId: string, playerName: string): Promise<Room> {
    const code = generateRoomCode()

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        id: code,
        player1_id: playerId,
        player1_name: playerName.trim(),
        board: Array(9).fill(null),
        status: "waiting",
        current_player: "X",
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async joinRoom(roomId: string, playerId: string, playerName: string): Promise<Room> {
    const { data: existingRoom, error: fetchError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId.toUpperCase())
      .single()

    if (fetchError || !existingRoom) {
      throw new Error("Room not found!")
    }

    // Check if player is trying to rejoin (was previously in the room)
    const isPlayer1 = existingRoom.player1_id === playerId
    const isPlayer2 = existingRoom.player2_id === playerId

    if (isPlayer1) {
      // Player 1 is rejoining - just update their name and ensure status is correct
      const { data, error } = await supabase
        .from("rooms")
        .update({
          player1_name: playerName.trim(),
          status: existingRoom.player2_id ? "playing" : "waiting",
        })
        .eq("id", roomId.toUpperCase())
        .select()
        .single()

      if (error) throw error
      return data
    }

    if (isPlayer2) {
      // Player 2 is rejoining - just update their name and ensure status is playing
      const { data, error } = await supabase
        .from("rooms")
        .update({
          player2_name: playerName.trim(),
          status: "playing",
        })
        .eq("id", roomId.toUpperCase())
        .select()
        .single()

      if (error) throw error
      return data
    }

    // New player trying to join
    if (existingRoom.player2_id) {
      throw new Error("Room is full!")
    }

    // New player joining as player 2
    const { data, error } = await supabase
      .from("rooms")
      .update({
        player2_id: playerId,
        player2_name: playerName.trim(),
        status: "playing",
      })
      .eq("id", roomId.toUpperCase())
      .select()
      .single()

    if (error) throw error
    return data
  }

  async makeMove(roomId: string, board: Board, playerSymbol: Player): Promise<void> {
    const gameResult = checkWinner(board)
    const nextPlayer = playerSymbol === "X" ? "O" : "X"
    
    // Convert Board (Player[]) to string[] for database storage
    const boardForDb = board.map(cell => cell === null ? null : cell)

    await supabase
      .from("rooms")
      .update({
        board: boardForDb,
        current_player: gameResult.winner ? playerSymbol : nextPlayer,
        winner: gameResult.winner || null,
        status: gameResult.winner ? "finished" : "playing",
      })
      .eq("id", roomId)
  }

  async resetGame(roomId: string): Promise<void> {
    const { data: room } = await supabase
      .from("rooms")
      .select("current_player")
      .eq("id", roomId)
      .single()

    if (!room) return

    await supabase
      .from("rooms")
      .update({
        board: Array(9).fill(null),
        current_player: room.current_player === "X" ? "O" : "X",
        winner: null,
        status: "playing",
      })
      .eq("id", roomId)
  }

  subscribeToRoom(
    roomId: string,
    onUpdate: (room: Room) => void,
    onStatusChange: (status: string) => void,
    playerId: string,
    onOpponentDisconnect?: () => void,
    onOpponentReconnect?: () => void,
  ): RealtimeChannel {
    let lastOpponentId: string | null = null
    let lastHeartbeatTime: number = Date.now()
    const HEARTBEAT_TIMEOUT = 10000 // 10 seconds

    // Function to check opponent presence via heartbeat
    const checkOpponentPresence = async () => {
      if (!lastOpponentId) return

      try {
        // Check presence state
        const state = this.channel?.presenceState()
        let foundOpponent = false
        
        if (state) {
          Object.values(state).forEach((presences: any) => {
            if (Array.isArray(presences)) {
              presences.forEach((presence: any) => {
                if (presence?.user_id === lastOpponentId) {
                  foundOpponent = true
                }
              })
            } else if (presences?.user_id === lastOpponentId) {
              foundOpponent = true
            }
          })
        }

        // Update heartbeat time if opponent is present
        if (foundOpponent) {
          lastHeartbeatTime = Date.now()
        } else {
          // Opponent not in presence - check if timeout exceeded
          if (Date.now() - lastHeartbeatTime > HEARTBEAT_TIMEOUT) {
            if (onOpponentDisconnect) {
              onOpponentDisconnect()
            }
          }
        }
      } catch (error) {
        console.error("Error checking opponent presence:", error)
      }
    }

    this.channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          presence: {
            key: playerId,
          },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Room update received:", payload.new)
          const updatedRoom = payload.new as Room
          
          // Track opponent ID
          const opponentId = updatedRoom.player1_id === playerId 
            ? updatedRoom.player2_id 
            : updatedRoom.player1_id
          
          if (opponentId && opponentId !== lastOpponentId) {
            // Opponent changed or reconnected
            if (lastOpponentId && opponentId) {
              // Reconnection
              if (onOpponentReconnect) {
                onOpponentReconnect()
              }
            }
            lastOpponentId = opponentId
            lastHeartbeatTime = Date.now()
          } else if (!opponentId && lastOpponentId) {
            // Opponent left (ID removed from room)
            lastOpponentId = null
            if (onOpponentDisconnect) {
              onOpponentDisconnect()
            }
          }
          
          onUpdate(updatedRoom)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Room insert received:", payload.new)
          const updatedRoom = payload.new as Room
          const opponentId = updatedRoom.player1_id === playerId 
            ? updatedRoom.player2_id 
            : updatedRoom.player1_id
          if (opponentId) {
            lastOpponentId = opponentId
            lastHeartbeatTime = Date.now()
          }
          onUpdate(updatedRoom)
        },
      )
      .on("presence", { event: "sync" }, () => {
        checkOpponentPresence()
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("Presence join event:", { key, newPresences })
        const presences = Array.isArray(newPresences) ? newPresences : [newPresences]
        presences.forEach((presence: any) => {
          console.log("Checking presence join:", presence?.user_id, "vs", playerId, "vs", lastOpponentId)
          if (presence?.user_id && presence.user_id !== playerId) {
            if (presence.user_id === lastOpponentId) {
              // Opponent reconnected
              lastHeartbeatTime = Date.now()
              console.log("Opponent reconnected via presence join")
              if (onOpponentReconnect) {
                onOpponentReconnect()
              }
            } else if (!lastOpponentId) {
              // First time seeing opponent
              lastOpponentId = presence.user_id
              lastHeartbeatTime = Date.now()
            }
          }
        })
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("Presence leave event:", { key, leftPresences })
        const presences = Array.isArray(leftPresences) ? leftPresences : [leftPresences]
        presences.forEach((presence: any) => {
          console.log("Checking presence leave:", presence?.user_id, "vs", playerId, "vs", lastOpponentId)
          if (presence?.user_id && presence.user_id !== playerId && presence.user_id === lastOpponentId) {
            console.log("Opponent left presence, scheduling disconnect check")
            // Mark that we saw them leave, but give a grace period
            setTimeout(() => {
              // Double-check they're still not present after timeout
              const state = this.channel?.presenceState()
              let stillGone = true
              if (state) {
                Object.values(state).forEach((presences: any) => {
                  if (Array.isArray(presences)) {
                    presences.forEach((p: any) => {
                      if (p?.user_id === lastOpponentId) stillGone = false
                    })
                  } else if (presences?.user_id === lastOpponentId) {
                    stillGone = false
                  }
                })
              }
              if (stillGone) {
                console.log("Opponent confirmed disconnected")
                if (onOpponentDisconnect) {
                  onOpponentDisconnect()
                }
              } else {
                console.log("Opponent reconnected during grace period")
              }
            }, 5000) // 5 second grace period
          }
        })
      })
      .subscribe(async (status) => {
        console.log("Subscription status:", status)
        
        if (status === "SUBSCRIBED" && this.channel) {
          // Track our own presence
          try {
            await this.channel.track({
              user_id: playerId,
              online_at: new Date().toISOString(),
            })
          } catch (error) {
            console.error("Error tracking presence:", error)
          }

          // Start heartbeat check
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
          }
          this.heartbeatInterval = setInterval(checkOpponentPresence, 3000) // Check every 3 seconds
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          // Clean up heartbeat
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
          }
        }
        
        onStatusChange(status)
      })

    return this.channel
  }

  unsubscribe(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
  }
}
