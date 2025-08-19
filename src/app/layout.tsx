// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {/* -------------------- Navbar -------------------- */}
        <nav className="navbar">
          <div className="container flex justify-between items-center">
            {/* Logo / Home */}
            <Link href="/" className="text-2xl font-bold text-white">
              Home
            </Link>

            {/* Nav links */}
            <div className="flex">
              <Link href="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link href="/nfts" className="text-gray-300 hover:text-white transition">
                NFTs
              </Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/chat" className="text-gray-300 hover:text-white transition">
                Chat
              </Link>
            </div>
          </div>
        </nav>

        {/* -------------------- Main content -------------------- */}
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
