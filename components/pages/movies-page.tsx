"use client"

import { useEffect, useState } from "react"
import { ContentGrid } from "../content-grid"
import type { Content } from "../streaming-app"

interface MoviesPageProps {
  onPlayContent: (content: Content) => void
}

export function MoviesPage({ onPlayContent }: MoviesPageProps) {
  const [movies, setMovies] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ws = new WebSocket("wss://nestfilm.hopto.org/content?type=singles")

    ws.onopen = () => {
      setLoading(false)
    }

    ws.onmessage = (event) => {
      try {
        const content: Content = JSON.parse(event.data)
        setMovies((prev) => {
          if (prev.some((m) => m.movie_id === content.movie_id)) {
            return prev
          }
          return [...prev, content]
        })
      } catch (error) {
        console.error("Error parsing movie data:", error)
      }
    }

    ws.onerror = () => {
      setLoading(false)
    }

    ws.onclose = () => {
      setLoading(false)
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Movies</h2>
      <ContentGrid content={movies} loading={loading} onPlayContent={onPlayContent} />
    </div>
  )
}
