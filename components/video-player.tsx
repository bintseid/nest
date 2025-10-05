"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Content } from "./streaming-app"
import { useState, useEffect } from "react"

interface VideoPlayerProps {
  content: Content
  authToken: string | null
  onClose: () => void
}

export function VideoPlayer({ content, authToken, onClose }: VideoPlayerProps) {
  const [error, setError] = useState(false)
  const [streamUrl, setStreamUrl] = useState("")

  useEffect(() => {
    const baseUrl = `https://nestfilm.hopto.org/stream?id=${content.movie_id}&collection=${content.collection_id}`
    const urlWithAuth = authToken ? `${baseUrl}&token=${authToken}` : baseUrl
    setStreamUrl(urlWithAuth)
  }, [content, authToken])

  const handleError = () => {
    console.log("[v0] Video playback error, stream URL:", streamUrl)
    setError(true)
  }

  const openInNewTab = () => {
    window.open(streamUrl, "_blank")
    onClose()
  }

  if (!authToken) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white text-lg">Please login to watch content</p>
          <Button onClick={onClose} className="bg-[#1A88F0] hover:bg-[#1A88F0]/90">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-4 right-4 z-10">
        <Button size="icon" variant="ghost" onClick={onClose} className="bg-black/50 hover:bg-black/70">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        {error ? (
          <div className="text-center space-y-4">
            <p className="text-white text-lg">Unable to play video in browser</p>
            <Button onClick={openInNewTab} className="bg-[#1A88F0] hover:bg-[#1A88F0]/90">
              Open Stream in New Tab
            </Button>
          </div>
        ) : (
          <video src={streamUrl} controls autoPlay className="w-full h-full" onError={handleError}>
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  )
}
