import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
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
        Insert: {
          id: string
          player1_id?: string | null
          player1_name?: string | null
          current_player?: "X" | "O"
          board?: string[]
          status?: "waiting" | "playing" | "finished"
        }
        Update: {
          player2_id?: string | null
          player2_name?: string | null
          current_player?: "X" | "O"
          board?: string[]
          winner?: string | null
          status?: "waiting" | "playing" | "finished"
        }
      }
    }
  }
}
