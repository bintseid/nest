"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Play, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Content } from "./streaming-app"

interface ContentGridProps {
  content: Content[]
  loading: boolean
  onPlayContent: (content: Content) => void
}

const API_BASE = "https://nestfilm.hopto.org"

export function ContentGrid({ content, loading, onPlayContent }: ContentGridProps) {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set())
  const [seriesEpisodes, setSeriesEpisodes] = useState<Content[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)

  useEffect(() => {
    if (!selectedSeries) {
      setSeriesEpisodes([])
      return
    }

    setLoadingEpisodes(true)
    const ws = new WebSocket(`wss://nestfilm.hopto.org/content?type=series&q=${encodeURIComponent(selectedSeries)}`)

    const episodes: Content[] = []

    ws.onopen = () => {
      console.log("[v0] Episodes WebSocket opened for:", selectedSeries)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        episodes.push(data)
      } catch (error) {
        console.error("[v0] Error parsing episode data:", error)
      }
    }

    ws.onclose = () => {
      console.log("[v0] Episodes WebSocket closed. Total episodes:", episodes.length)
      setSeriesEpisodes(episodes.sort((a, b) => (a.episode || 0) - (b.episode || 0)))
      setLoadingEpisodes(false)
    }

    ws.onerror = (error) => {
      console.error("[v0] Episodes WebSocket error:", error)
      setLoadingEpisodes(false)
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [selectedSeries])

  const handleDownload = async (item: Content, e: React.MouseEvent) => {
    e.stopPropagation()

    if (downloadingIds.has(item.movie_id)) {
      return
    }

    setDownloadingIds((prev) => new Set(prev).add(item.movie_id))

    try {
      const authToken = localStorage.getItem("nest-auth-token")

      if (!authToken) {
        alert("Please login to download content")
        setDownloadingIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(item.movie_id)
          return newSet
        })
        return
      }

      const streamResponse = await fetch(
        `${API_BASE}/stream?id=${item.movie_id}&collection=${item.collection_id}&token=${authToken}`,
      )

      if (!streamResponse.ok) {
        throw new Error("Failed to get download token")
      }

      const streamUrl = streamResponse.url
      const urlParams = new URLSearchParams(streamUrl.split("?")[1])
      const downloadToken = urlParams.get("token") || authToken

      const downloadUrl = `${API_BASE}/direct_download?token=${downloadToken}`

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `${item.series_name || item.name}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      const downloads = JSON.parse(localStorage.getItem("nest-downloads") || "[]")
      const downloadItem = {
        ...item,
        downloadedAt: new Date().toISOString(),
      }

      if (!downloads.some((d: Content) => d.movie_id === item.movie_id)) {
        downloads.push(downloadItem)
        localStorage.setItem("nest-downloads", JSON.stringify(downloads))
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download. Please login and try again.")
    } finally {
      setTimeout(() => {
        setDownloadingIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(item.movie_id)
          return newSet
        })
      }, 1000)
    }
  }

  const handleSeriesClick = (item: Content, e: React.MouseEvent) => {
    if (item.collection_id === "series" && item.series_name) {
      e.stopPropagation()
      setSelectedSeries(item.series_name)
    } else {
      onPlayContent(item)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glass rounded-lg aspect-[2/3] animate-pulse" />
        ))}
      </div>
    )
  }

  if (content.length === 0) {
    return (
      <div className="glass rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No content available</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {content.map((item) => {
          const thumbnailUrl =
            item.thumbnail ||
            `/placeholder.svg?height=450&width=300&query=${encodeURIComponent(item.series_name || item.name)}`

          return (
            <div
              key={item.movie_id}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden glass cursor-pointer transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
              onClick={(e) => handleSeriesClick(item, e)}
            >
              <img
                src={thumbnailUrl || "/placeholder.svg"}
                alt={item.series_name || item.name}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Button
                    size="icon"
                    className="rounded-full bg-primary hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPlayContent(item)
                    }}
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full bg-transparent"
                    onClick={(e) => handleDownload(item, e)}
                    disabled={downloadingIds.has(item.movie_id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2">{item.series_name || item.name}</h3>
                  {item.episode && (
                    <p className="text-xs text-muted-foreground">
                      S{item.season || 1} E{item.episode}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{(item.file_size / (1024 * 1024)).toFixed(0)} MB</span>
                  </div>
                </div>
              </div>

              {item.collection_id === "series" && item.series_name && (
                <div className="absolute top-2 left-2 bg-primary/90 rounded-full px-2 py-1 text-xs font-medium">
                  Episodes
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-strong rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold">{selectedSeries}</h2>
              <Button size="icon" variant="ghost" onClick={() => setSelectedSeries(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="overflow-y-auto p-6">
              {loadingEpisodes ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass rounded-lg aspect-video animate-pulse" />
                  ))}
                </div>
              ) : seriesEpisodes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No episodes found for this series</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {seriesEpisodes.map((episode) => {
                    const thumbnailUrl =
                      episode.thumbnail ||
                      `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(episode.series_name || episode.name)}`

                    return (
                      <div
                        key={episode.movie_id}
                        className="glass rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all"
                        onClick={() => {
                          setSelectedSeries(null)
                          onPlayContent(episode)
                        }}
                      >
                        <div className="relative aspect-video">
                          <img
                            src={thumbnailUrl || "/placeholder.svg"}
                            alt={episode.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                Episode {episode.episode}
                                {episode.season && ` - Season ${episode.season}`}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{episode.name}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </Button>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {(episode.file_size / (1024 * 1024)).toFixed(0)} MB
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(episode, e)
                            }}
                            disabled={downloadingIds.has(episode.movie_id)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
