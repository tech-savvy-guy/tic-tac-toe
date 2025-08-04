"use client"
import { ArrowLeft } from "lucide-react"
import type { OnlineMode, ConnectionStatus } from "@/types/game"

interface OnlineSetupScreenProps {
  onlineMode: OnlineMode
  setOnlineMode: (mode: OnlineMode) => void
  playerName: string
  setPlayerName: (name: string) => void
  joinCode: string
  setJoinCode: (code: string) => void
  connectionStatus: ConnectionStatus
  onCreateRoom: () => void
  onJoinRoom: () => void
  onBack: () => void
}

export function OnlineSetupScreen({
  onlineMode,
  setOnlineMode,
  playerName,
  setPlayerName,
  joinCode,
  setJoinCode,
  connectionStatus,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: OnlineSetupScreenProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-xs space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-all duration-200 group">
            <ArrowLeft className="h-5 w-5 text-black/60 group-hover:text-black transition-colors" />
          </button>
          <h2 className="text-sm font-light tracking-widest text-black/60 uppercase">ONLINE</h2>
          <div className="w-9"></div>
        </div>

        <div className="space-y-6">
          {/* Mode Toggle - Ultra Minimal */}
          <div className="flex">
            <button
              onClick={() => setOnlineMode("create")}
              className={`flex-1 py-2 text-sm font-light tracking-wider transition-all duration-200 relative ${
                onlineMode === "create"
                  ? "text-black"
                  : "text-black/30 hover:text-black/50"
              }`}
            >
              CREATE
              {onlineMode === "create" && (
                <div className="absolute -bottom-1 left-1/2 w-4 h-[2px] bg-black/40 transform -translate-x-1/2 transition-all duration-200" />
              )}
            </button>
            <button
              onClick={() => setOnlineMode("join")}
              className={`flex-1 py-2 text-sm font-light tracking-wider transition-all duration-200 relative ${
                onlineMode === "join"
                  ? "text-black"
                  : "text-black/30 hover:text-black/50"
              }`}
            >
              JOIN
              {onlineMode === "join" && (
                <div className="absolute -bottom-1 left-1/2 w-4 h-[2px] bg-black/40 transform -translate-x-1/2 transition-all duration-200" />
              )}
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="YOUR NAME"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full py-3 px-0 bg-transparent border border-black focus:border-black outline-none font-light tracking-wide placeholder:text-black/40 text-center"
              maxLength={20}
            />

            {onlineMode === "join" && (
              <input
                type="text"
                placeholder="ROOM CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full py-3 px-0 bg-transparent border border-black focus:border-black outline-none font-light tracking-widest placeholder:text-black/40 text-center"
                maxLength={6}
              />
            )}
          </div>

          <button
            onClick={onlineMode === "create" ? onCreateRoom : onJoinRoom}
            disabled={
              !playerName.trim() || (onlineMode === "join" && !joinCode.trim()) || connectionStatus === "connecting"
            }
            className="w-full py-4 bg-black text-white font-light tracking-wide hover:bg-black/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connectionStatus === "connecting"
              ? onlineMode === "create"
                ? "CREATING..."
                : "JOINING..."
              : onlineMode === "create"
                ? "CREATE ROOM"
                : "JOIN ROOM"}
          </button>
        </div>
      </div>
    </div>
  )
}
