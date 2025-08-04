import { supabase } from "@/lib/supabase"
import type { Room, Board, Player } from "@/types/game"
import { generateRoomCode, checkWinner } from "@/utils/game-logic"
import type { RealtimeChannel } from "@supabase/supabase-js"

export class OnlineGameService {
  private channel: RealtimeChannel | null = null

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

    if (existingRoom.player2_id) {
      throw new Error("Room is full!")
    }

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
  ): RealtimeChannel {
    this.channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Listen specifically to updates
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Room update received:", payload.new) // Debug log
          const updatedRoom = payload.new as Room
          onUpdate(updatedRoom)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Also listen to inserts (just in case)
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Room insert received:", payload.new) // Debug log
          const updatedRoom = payload.new as Room
          onUpdate(updatedRoom)
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status) // Debug log
        onStatusChange(status)
      })

    return this.channel
  }

  unsubscribe(): void {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
  }
}
