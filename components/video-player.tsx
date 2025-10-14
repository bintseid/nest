"use client"
import { useState, useEffect } from "react"
import { X, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Content, User } from "./streaming-app"

const API_BASE = "https://nestfilm.hopto.org"

interface VideoPlayerProps {
  content: Content
  authToken?: string | null
  onClose: () => void
}

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (token: string, user: User) => void
}

export function VideoPlayer({ content, authToken, onClose }: VideoPlayerProps) {
  const [tokenToUse, setTokenToUse] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [videoMetadata, setVideoMetadata] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Only use the token provided by the parent component (authToken)
    // Don't fallback to persisted tokens if the parent has intentionally passed null (after logout)
    setTokenToUse(authToken || null)
  }, [authToken])

  const idParam = (content as any).movie_id ?? (content as any).id
  const collectionParam = (content as any).collection_id ?? (content as any).collection
  // Use streaming endpoint for the <video> element so the browser can request byte ranges
  const baseParams = `id=${encodeURIComponent(idParam ?? "")}&collection=${encodeURIComponent(
    collectionParam ?? ""
  )}&collection_id=${encodeURIComponent(collectionParam ?? "")}`
  const directUrl = `/api/proxy?path=/stream&${baseParams}${tokenToUse ? `&token=${encodeURIComponent(tokenToUse)}` : ""}`

  // Handle video loading and error states
  const handleVideoLoadStart = () => {
    setIsLoading(true)
    setVideoError(null)
  }

  const handleVideoCanPlay = () => {
    setIsLoading(false)
    setVideoError(null)
    setError(null)
  }

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const metadata = {
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      networkState: video.networkState,
      currentSrc: video.currentSrc,
      canPlayType: {
        'video/mp4': video.canPlayType('video/mp4'),
        'video/mp4; codecs="avc1.42E01E,mp4a.40.2"': video.canPlayType('video/mp4; codecs="avc1.42E01E,mp4a.40.2"'),
        'video/webm': video.canPlayType('video/webm')
      }
    }
    setVideoMetadata(metadata)
    
    // Generate debug info
    const debug = `Video loaded: ${video.videoWidth}x${video.videoHeight}, Duration: ${video.duration}s, ReadyState: ${video.readyState}, NetworkState: ${video.networkState}`
    setDebugInfo(debug)
    console.log('Video metadata:', metadata)
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setIsLoading(false)
    const video = e.currentTarget
    const error = video.error
    
    let errorMessage = "Video playback error"
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Video playback was aborted"
          break
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading video"
          break
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Video format not supported or corrupted file"
          break
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Video format not supported by browser"
          break
        default:
          errorMessage = `Video error: ${error.message || 'Unknown error'}`
      }
    }
    
    setVideoError(errorMessage)
    setError(errorMessage)
  }

  const openInNewTab = () => {
    // open backend URL directly for testing (will 401 if backend expects header)
    window.open(directUrl, "_blank", "noopener")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl bg-black rounded">
        <div className="absolute top-3 right-3 z-20">
          <Button size="icon" variant="ghost" onClick={onClose} className="bg-black/50 hover:bg-black/60">
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        {!tokenToUse ? (
          <div className="p-8 text-center text-white">
            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Login Required</h3>
                <p className="text-white">Please login to watch this content</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowAuth(true)} 
                  variant="glass"
                  className="w-full border-[#1a88f0] py-3 text-lg font-semibold rounded-lg"
                >
                  <UserIcon className="w-5 h-5 mr-2" />
                  Login to Watch
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1a88f0]/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-black text-white">or</span>
                  </div>
                </div>
                
                <Button 
                  onClick={openInNewTab} 
                  variant="glass"
                  className="w-full py-3 rounded-lg"
                >
                  Open Stream in New Tab
                </Button>
              </div>
              
              {error && (
                <div className="p-4 bg-[#252538] border border-[#1a88f0]/50 rounded-lg">
                  <p className="text-sm text-[#1a88f0]">{error}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Loading video...</p>
                </div>
              </div>
            )}
            <video
              controls
              className="w-full h-[33vh] bg-black mx-auto my-auto block"
              style={{ maxWidth: '100%', maxHeight: '33vh', objectFit: 'contain' }}
              onLoadStart={handleVideoLoadStart}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              preload="metadata"
            >
              <source src={directUrl} type="video/mp4" />
              <source src={directUrl} type="video/avi" />
              <source src={directUrl} type="video/x-msvideo" />
              <source src={directUrl} type="video/webm" />
              <source src={directUrl} type="video/quicktime" />
              <p className="text-white p-4">
                Your browser doesn't support HTML5 video. 
                <a href={directUrl} className="text-blue-400 underline">Download the video</a> instead.
              </p>
            </video>
            <div className="flex items-center justify-between px-4 py-3 glass text-white">
              <div className="text-sm truncate max-w-[70%]">{(content as any).name || (content as any).title || "Video"}</div>
              <Button size="sm" variant="glass" onClick={onClose}>
                Close
              </Button>
            </div>
            {videoError && (
              <div className="p-3 text-center text-sm text-red-400 glass rounded">
                <p className="font-semibold mb-1 text-white">Video Playback Error</p>
                <p className="text-white">{videoError}</p>
                <div className="mt-2 text-xs text-white">
                  <p>This might be due to:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Video file format not supported by browser</li>
                    <li>Corrupted or incomplete video file</li>
                    <li>Network connectivity issues</li>
                    <li>Video codec compatibility problems</li>
                  </ul>
                  <p className="mt-2 text-white">
                    Contact support if issues persist.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(token, user) => {
          // persist and make available immediately
          localStorage.setItem("nest-auth-token", token)
          localStorage.setItem("nest_auth_token", token)
          setTokenToUse(token)
          setShowAuth(false)
        }}
      />
    </div>
  )
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const handleRequestOtp = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStep("otp")
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!phone?.trim() || !otp?.trim()) {
      setError("Phone and code are required")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: otp.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.token) {
        // persist under canonical + legacy keys
        localStorage.setItem("nest-auth-token", data.token)
        localStorage.setItem("nest_auth_token", data.token)
        onSuccess(data.token, data.user)
      } else {
        setError(data.error || "Invalid code")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#252538]/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1f1f2e] rounded-xl p-6 border border-[#1a88f0]/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Login</h3>
          <Button size="icon" variant="glass" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {step === "phone" ? (
          <div className="space-y-3">
            <div>
              <Label className="text-white">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" className="glass border-[#1a88f0]/50 text-white" />
            </div>
            {error && <p className="text-sm text-white">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="glass" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleRequestOtp} disabled={loading} variant="glass" className="border-[#1a88f0]">
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-[#1a88f0]">Code</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="bg-[#252538] border-[#1a88f0]/50 text-white" />
            </div>
            {error && <p className="text-sm text-[#1a88f0]">{error}</p>}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("phone")} className="border-[#1a88f0]/50 text-[#1a88f0]">
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="border-[#1a88f0]/50 text-[#1a88f0]">
                  Cancel
                </Button>
                <Button onClick={handleVerify} disabled={loading} className="bg-[#1a88f0] hover:bg-[#1a88f0]/90">
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
