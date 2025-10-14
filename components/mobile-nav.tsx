"use client"

import { Home, Film, Tv, Download } from "lucide-react"
import type { PageType } from "./streaming-app"

interface MobileNavProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
}

export function MobileNav({ currentPage, onPageChange }: MobileNavProps) {
  const navItems = [
    { id: "home" as PageType, label: "Home", icon: Home },
    { id: "series" as PageType, label: "Series", icon: Tv },
    { id: "movies" as PageType, label: "Movies", icon: Film },
    { id: "downloads" as PageType, label: "Downloads", icon: Download },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                isActive ? "text-[#1a88f0]" : "text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
