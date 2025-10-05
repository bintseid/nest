"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "./streaming-app"

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (token: string, user: User) => void
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [userId, setUserId] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const handleRequestOtp = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://nestfilm.hopto.org/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (response.ok) {
        setUserId(data.user_id)
        setStep("otp")
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://nestfilm.hopto.org/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("nest_auth_token", data.token)
        onSuccess(data.token, data.user)
      } else {
        setError(data.error || "Invalid OTP")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-strong rounded-lg w-full max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Login</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+251912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass"
              />
              <p className="text-xs text-muted-foreground">Enter your registered phone number with country code</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleRequestOtp}
              disabled={loading || !phone}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="glass"
              />
              <p className="text-xs text-muted-foreground">Check your Telegram for the verification code</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("phone")} className="flex-1 glass">
                Back
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
