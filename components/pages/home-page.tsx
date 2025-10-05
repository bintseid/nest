"use client"

import { useEffect, useState } from "react"
import { ContentGrid } from "../content-grid"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Content } from "../streaming-app"

interface HomePageProps {
  onPlayContent: (content: Content) => void
}

export function HomePage({ onPlayContent }: HomePageProps) {
  const [featuredContent, setFeaturedContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ws = new WebSocket("wss://nestfilm.hopto.org/content?type=series")

    ws.onopen = () => {
      setLoading(false)
    }

    ws.onmessage = (event) => {
      try {
        const content: Content = JSON.parse(event.data)
        setFeaturedContent((prev) => {
          if (prev.length < 20) return [...prev, content]
          return prev
        })
      } catch (error) {
        console.error("Error parsing content data:", error)
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

  const heroContent = featuredContent[0]

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      {heroContent && (
        <div className="relative h-[70vh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroContent.thumbnail || "/abstract-movie-poster.png"})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="relative container mx-auto px-4 h-full flex items-end pb-16">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-5xl md:text-6xl font-bold text-balance">
                {heroContent.series_name || heroContent.name}
              </h2>
              <p className="text-lg text-muted-foreground">{heroContent.genre?.join(" • ")}</p>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => onPlayContent(heroContent)}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Play Now
                </Button>
                <Button size="lg" variant="outline" className="glass bg-transparent">
                  More Info
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Content */}
      <div className="container mx-auto px-4 space-y-6">
        <h3 className="text-2xl font-bold">Featured Content</h3>
        <ContentGrid content={featuredContent.slice(1)} loading={loading} onPlayContent={onPlayContent} />
      </div>
    </div>
  )
}
