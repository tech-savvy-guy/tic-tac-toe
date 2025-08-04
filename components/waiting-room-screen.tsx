"use client"

import { ArrowLeft, Copy, Users, Wifi, WifiOff } from "lucide-react"
import type { ConnectionStatus } from "@/types/game"

interface WaitingRoomScreenProps {
  roomCode: string
  connectionStatus: ConnectionStatus
  onBack: () => void
  onCopyRoomCode: () => void
}

export function WaitingRoomScreen({ roomCode, connectionStatus, onBack, onCopyRoomCode }: WaitingRoomScreenProps) {
  console.log("WaitingRoomScreen rendered with:", { roomCode, connectionStatus }) // Debug log

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="w-full max-w-xs space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-all duration-200 group">
            <ArrowLeft className="h-5 w-5 text-black/60 group-hover:text-black transition-colors" />
          </button>
          <h2 className="text-sm font-light tracking-widest text-black/60 uppercase">WAITING</h2>
          <div className="flex items-center space-x-1">
            {connectionStatus === "connected" ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-black/60 font-light tracking-wide">ROOM CODE</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl font-light tracking-widest text-black">{roomCode}</span>
              <button
                onClick={onCopyRoomCode}
                className="p-2 hover:bg-black/5 rounded-full transition-all duration-200"
              >
                <Copy className="h-4 w-4 text-black/60" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-5 w-5 text-black/40" />
              <span className="text-black/60 font-light">Waiting for opponent...</span>
            </div>
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-black/20 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-black/20 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-black/20 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
            {/* Debug info - remove this later */}
            <div className="text-xs text-gray-400">Status: {connectionStatus}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
