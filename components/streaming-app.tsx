"use client"

import { useState } from "react"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { HomePage } from "./pages/home-page"
import { MoviesPage } from "./pages/movies-page"
import { SeriesPage } from "./pages/series-page"
import { DownloadsPage } from "./pages/downloads-page"
import { SearchPage } from "./pages/search-page"
import { AuthModal } from "./auth-modal"
import { SubscribeModal } from "./subscribe-modal"
import { VideoPlayer } from "./video-player"
import { ContactPage } from "./contact-page"

export type PageType = "home" | "movies" | "series" | "downloads" | "search"

export interface User {
  user_id: string
  phone: string
  balance: number
  subscription_end?: string
}

export interface Content {
  movie_id: number
  collection_id: string
  name: string
  file_size: number
  price: number
  genre: string[]
  translator: string | null
  country: string[]
  series_name?: string
  episode?: number
  season?: number
  thumbnail?: string
}

export function StreamingApp() {
  const [currentPage, setCurrentPage] = useState<PageType>("home")
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showContactPage, setShowContactPage] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    setAuthToken(null)
    setUser(null)
    setShowPlayer(false); // Close video player if open
    setSelectedContent(null); // Clear selected content
    localStorage.removeItem("nest-auth-token")
    localStorage.removeItem("nest_auth_token")
  }

  const handlePlayContent = (content: Content) => {
    // Check if user is authenticated before allowing playback
    if (!authToken) {
      // If not authenticated, show auth modal instead
      setShowAuthModal(true);
      return;
    }
    
    setSelectedContent(content)
    setShowPlayer(true)
  }

  const handleSearch = () => {
    setCurrentPage("search");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        user={user}
        onContactClick={() => setShowContactPage(true)}
        onLogout={handleLogout}
        onSubscribeClick={() => setShowSubscribeModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      <main className="pt-16 pb-20 md:pb-8">
        {currentPage === "home" && <HomePage onPlayContent={handlePlayContent} />}
        {currentPage === "movies" && <MoviesPage onPlayContent={handlePlayContent} />}
        {currentPage === "series" && <SeriesPage onPlayContent={handlePlayContent} />}
        {currentPage === "downloads" && <DownloadsPage />}
        {currentPage === "search" && (
          <SearchPage 
            onPlayContent={handlePlayContent} 
            onBack={() => setCurrentPage("home")} 
            initialSearchQuery={searchQuery}
          />
        )}

      </main>

      <MobileNav currentPage={currentPage} onPageChange={setCurrentPage} />

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(token, userData) => {
          setAuthToken(token)
          setUser(userData)
          setShowAuthModal(false)
        }}
      />

      <SubscribeModal
        open={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        authToken={authToken}
        user={user}
        onSuccess={(updatedUser) => setUser(updatedUser)}
      />

      {showPlayer && selectedContent && (
        <VideoPlayer
          content={selectedContent}
          authToken={authToken}
          onClose={() => {
            setShowPlayer(false)
            setSelectedContent(null)
          }}
        />
      )}

      {showContactPage && (
        <ContactPage
          user={user}
          onClose={() => setShowContactPage(false)}
          onLogout={handleLogout}
          onSubscribeClick={() => setShowSubscribeModal(true)}
          onLoginClick={() => setShowAuthModal(true)}
        />
      )}
    </div>
  )
}
