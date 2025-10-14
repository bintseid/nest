"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { User, LogOut, Search } from "lucide-react"
import type { PageType, User as UserType } from "./streaming-app"

interface HeaderProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  user: UserType | null
  onContactClick: () => void
  onLogout: () => void
  onSubscribeClick: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: () => void
}

export function Header({ currentPage, onPageChange, user, onContactClick, onLogout, onSubscribeClick, searchQuery, onSearchChange, onSearch }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems: { id: PageType; label: string }[] = [
    { id: "series", label: "Series" },
    { id: "movies", label: "Movies" },
  ]

  const goToSearchPage = () => {
    onPageChange("search");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-[#1a88f0]">Nest</h1>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? "text-primary border border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="glass"
              onClick={goToSearchPage}
            >
              <Search className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="glass"
              onClick={onContactClick}
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
