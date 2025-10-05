"use client"

import { useEffect, useState } from "react"
import { Download, Trash2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Content } from "../streaming-app"

interface DownloadItem extends Content {
  downloadProgress: number
  downloadedAt: string
}

export function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])

  useEffect(() => {
    localStorage.removeItem("nest-downloads")
    setDownloads([])

    // Load downloads from localStorage
    const savedDownloads = localStorage.getItem("nest-downloads")
    if (savedDownloads) {
      try {
        setDownloads(JSON.parse(savedDownloads))
      } catch (error) {
        console.error("Error loading downloads:", error)
      }
    }
  }, [])

  const removeDownload = (movieId: number) => {
    const updatedDownloads = downloads.filter((d) => d.movie_id !== movieId)
    setDownloads(updatedDownloads)
    localStorage.setItem("nest-downloads", JSON.stringify(updatedDownloads))
  }

  const handlePlay = (download: DownloadItem) => {
    const authToken = localStorage.getItem("nest-auth-token")
    const streamUrl = `https://nestfilm.hopto.org/stream?id=${download.movie_id}&collection=${download.collection_id}${authToken ? `&token=${authToken}` : ""}`
    window.open(streamUrl, "_blank")
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Downloads</h2>
      </div>

      {/* Downloads List */}
      <div className="space-y-4">
        {downloads.map((download) => (
          <div key={download.movie_id} className="glass rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                {download.thumbnail && (
                  <img
                    src={download.thumbnail || "/placeholder.svg"}
                    alt={download.series_name || download.name}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{download.series_name || download.name}</h3>
                  {download.episode && (
                    <p className="text-sm text-muted-foreground">
                      Season {download.season || 1} Episode {download.episode}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{(download.file_size / (1024 * 1024)).toFixed(0)} MB</p>
                  <p className="text-xs text-muted-foreground">
                    Downloaded {new Date(download.downloadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="text-primary" onClick={() => handlePlay(download)}>
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeDownload(download.movie_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {downloads.length === 0 && (
        <div className="glass rounded-lg p-12 text-center space-y-4">
          <Download className="w-12 h-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No downloads yet</h3>
            <p className="text-sm text-muted-foreground">Download content to watch offline</p>
          </div>
        </div>
      )}
    </div>
  )
}
