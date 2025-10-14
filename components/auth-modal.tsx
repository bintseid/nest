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

  const handleVerify = async () => {
    if (!phone?.trim() || !otp?.trim()) {
      setError("Phone and code are required")
      return
    }
    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://nestfilm.hopto.org/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: otp.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        // store canonical key and keep old key for compatibility
        localStorage.setItem("nest-auth-token", data.token)
        localStorage.setItem("nest_auth_token", data.token)
        console.log("login/verify OK, token saved:", data.token)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-strong rounded-xl w-full max-w-md p-8 space-y-6 border border-[#1a88f0]/30">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white">
              Welcome Back
            </h2>
            <p className="text-sm text-white">Sign in to continue watching</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-[#1a88f0] p-2 rounded-lg hover:bg-[#252538] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+251912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#252538] border-[#1a88f0]/50 text-white"
              />
              <p className="text-xs text-white">Enter your registered phone number with country code</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[#252538] border border-[#1a88f0]/50">
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            <Button
              onClick={handleRequestOtp}
              disabled={loading || !phone}
              variant="glass"
              className="w-full border-[#1a88f0] py-3 text-lg font-semibold rounded-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-white">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="bg-[#252538] border-[#1a88f0]/50 text-white"
              />
              <p className="text-xs text-white">Check your Telegram for the verification code</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[#252538] border border-[#1a88f0]/50">
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep("phone")} 
                className="flex-1 border-[#1a88f0]/50 text-white py-3 rounded-lg transition-all duration-200 hover:border-[#1a88f0]"
              >
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={loading || !otp}
                variant="glass"
                className="flex-1 border-[#1a88f0] py-3 text-lg font-semibold rounded-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
