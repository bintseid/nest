"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
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

  useEffect(() => {
    const persisted =
      typeof window !== "undefined"
        ? localStorage.getItem("nest-auth-token") || localStorage.getItem("nest_auth_token")
        : null
    setTokenToUse(authToken || persisted)
  }, [authToken])

  const idParam = (content as any).movie_id ?? (content as any).id
  const collectionParam = (content as any).collection_id ?? (content as any).collection
  // Use streaming endpoint for the <video> element so the browser can request byte ranges
  const baseParams = `id=${encodeURIComponent(idParam ?? "")}&collection=${encodeURIComponent(
    collectionParam ?? ""
  )}&collection_id=${encodeURIComponent(collectionParam ?? "")}`
  const directUrl = `/api/proxy?path=/stream&${baseParams}${tokenToUse ? `&token=${encodeURIComponent(tokenToUse)}` : ""}`

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
            <p className="mb-4">Please login to watch content</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowAuth(true)} className="bg-[#1A88F0] hover:bg-[#1A88F0]/90">
                Login
              </Button>
              <Button onClick={openInNewTab} variant="secondary">
                Open Stream in New Tab
              </Button>
            </div>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="w-full">
            <video
              controls
              className="w-full h-[70vh] bg-black"
              onError={() => setError("Video playback error — check network / auth")}
              onCanPlay={() => setError(null)}
            >
              <source src={directUrl} type="video/mp4" />
            </video>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900/60 text-white">
              <div>{(content as any).name || (content as any).title || "Video"}</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={openInNewTab}>
                  Open in new tab
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
            {error && <p className="p-3 text-center text-sm text-red-400">{error}</p>}
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
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white rounded p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Login</h3>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {step === "phone" ? (
          <div className="space-y-3">
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleRequestOtp} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Code</Label>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("phone")}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleVerify} disabled={loading}>
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
