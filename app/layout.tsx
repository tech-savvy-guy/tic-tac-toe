import "./globals.css";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tic Tac Toe | Soham Datta",
    template: "%s | Tic Tac Toe"
  },
  description: "A modern Tic Tac Toe game built with v0. Play against friends online or challenge the AI in this beautifully designed game.",
  keywords: ["game", "tic-tac-toe", "multiplayer", "online game", "browser game", "v0"],
  authors: [{ name: "tech-savvy-guy" }],
  creator: "Soham Datta",
  publisher: "tech-savvy-guy",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Tic Tac Toe | Soham Datta",
    description: "A modern Tic Tac Toe game built with v0. Play against friends online or challenge the AI in this beautifully designed game.",
    siteName: "Tic Tac Toe | Soham Datta",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Tic Tac Toe Preview"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tic Tac Toe | Soham Datta",
    description: "A modern Tic Tac Toe game built with v0. Play against friends online or challenge the AI in this beautifully designed game.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen pb-16 h-full overflow-auto sm:overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main>
            {children}
            <Analytics />
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
