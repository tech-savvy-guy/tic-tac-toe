"use client"

import { ThemeToggle } from "./theme-toggle"

export function Footer() {
    return (
        <footer className="bottom-0 left-0 w-full py-3 px-4 sm:px-6 pb-6 font-mono select-none">
            <div className="max-w-screen-xl mx-auto flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <span>~/</span>
                <a
                    href="https://sohamdatta.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors duration-200"
                >
                    Soham Datta
                </a>
                <span>•</span>
                <a
                    href="https://v0.dev/chat/api/open?title=tic-tac-toe&prompt=Build+a+sleek+tic-tac-toe+game+using+Next.js+App+Router+and+Supabase+Realtime%2C+supporting+local+and+multiplayer+%28online%2Foffline%29+gameplay.&url=https%3A%2F%2Ftic-tac-toe-by-v0.vercel.app%2Ftic-tac-toe-game.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground/75 transition-colors duration-200"
                >
                    <svg width="20" viewBox="0 0 40 20" fill="currentColor">
                        <path d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z" />
                        <path d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z" />
                    </svg>
                </a>
                <span>•</span>
                <a
                    href="https://github.com/tech-savvy-guy/tic-tac-toe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors duration-200"
                >
                    GitHub
                </a>
                <span>•</span>
                <ThemeToggle />
                <span>/~</span>
            </div>
        </footer>
    )
}