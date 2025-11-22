import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {

    const authHeader = request.headers.get("Authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return new NextResponse("CRON_SECRET not configured", { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    const oneHourAgoISO = oneHourAgo.toISOString()

    // Logging the count of games to be deleted
    const { count: oldGamesCount } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
      .lt("created_at", oneHourAgoISO)

    const { count: finishedGamesCount } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "finished")

    // Deleting games older than 1 hour
    const { error: deleteOldError } = await supabase
      .from("rooms")
      .delete()
      .lt("created_at", oneHourAgoISO)

    if (deleteOldError) {
      console.error("Error deleting old games:", deleteOldError)
      return NextResponse.json(
        { error: "Failed to delete old games", details: deleteOldError.message },
        { status: 500 }
      )
    }

    // Deleting games in finished state
    const { error: deleteFinishedError } = await supabase
      .from("rooms")
      .delete()
      .eq("status", "finished")

    if (deleteFinishedError) {
      console.error("Error deleting finished games:", deleteFinishedError)
      return NextResponse.json(
        { error: "Failed to delete finished games", details: deleteFinishedError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Cron job completed successfully",
      deletedOldGames: oldGamesCount || 0,
      deletedFinishedGames: finishedGamesCount || 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
