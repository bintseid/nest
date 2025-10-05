"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { User, LogOut } from "lucide-react"
import type { PageType, User as UserType } from "./streaming-app"

interface HeaderProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  user: UserType | null
  onLoginClick: () => void
  onLogout: () => void
  onSubscribeClick: () => void
}

export function Header({ currentPage, onPageChange, user, onLoginClick, onLogout, onSubscribeClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const navItems: { id: PageType; label: string }[] = [
    { id: "series", label: "Series" },
    { id: "movies", label: "Movies" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Nest</h1>

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
            <div className="hidden sm:flex items-center gap-2 glass rounded-md px-3 py-2 w-64">
              <Input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 focus-visible:ring-0 text-sm h-auto py-0"
              />
              <Button size="sm" className="h-7 px-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                Search
              </Button>
            </div>

            {user ? (
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="glass border-primary/50 hover:border-primary"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user.phone}
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-lg border border-border/50 p-2 space-y-1">
                    <div className="px-3 py-2 text-sm">
                      <p className="text-muted-foreground">Balance</p>
                      <p className="font-semibold">${user.balance.toFixed(2)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onSubscribeClick()
                        setShowUserMenu(false)
                      }}
                      className="w-full justify-start"
                    >
                      Subscribe
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onLogout()
                        setShowUserMenu(false)
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={onLoginClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
