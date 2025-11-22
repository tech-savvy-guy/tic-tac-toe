"use client"

import { Copy, Check, Wifi, WifiOff, Users } from "lucide-react"
import { useState } from "react"
import type { ConnectionStatus } from "@/types/game"

interface DisconnectDialogProps {
  isOpen: boolean
  opponentName: string
  roomCode: string
  connectionStatus: ConnectionStatus
  onClose?: () => void
}

export function DisconnectDialog({ isOpen, opponentName, roomCode, connectionStatus, onClose }: DisconnectDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background border border-border/50 rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="w-full flex items-center justify-between">
            <div className="w-8"></div>
            <h3 className="text-lg font-light tracking-widest uppercase text-muted-foreground">
              Waiting for Opponent
            </h3>
            <div className="flex items-center space-x-1">
              {connectionStatus === "connected" ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-error" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground/70 font-light font-mono leading-relaxed">
              {opponentName || "Your opponent"} has disconnected.
            </p>
          </div>

          <div className="w-full space-y-2">
            <p className="text-muted-foreground font-light tracking-wide text-center">ROOM CODE</p>
            <div className="relative flex items-center justify-center w-full max-w-xs mx-auto">
              <span className="text-3xl font-light font-mono tracking-widest text-foreground select-all">
                {roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="absolute right-0 p-2 hover:bg-muted/5 rounded-full transition-all duration-200 group"
                title="Copy room code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success transition-colors" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground group-active:text-success transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground/20 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground/20 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground/20 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground/60">Status: {connectionStatus}</div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-3 text-xs font-light tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/20 rounded-lg border border-border/30"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
