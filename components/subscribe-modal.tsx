"use client"

import { useState } from "react"
import { X, Crown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "./streaming-app"

interface SubscribeModalProps {
  open: boolean
  onClose: () => void
  authToken: string | null
  user: User | null
  onSuccess: (user: User) => void
}

export function SubscribeModal({ open, onClose, authToken, user, onSuccess }: SubscribeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<number>(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const plans = [
    { days: 7, price: 5, popular: false },
    { days: 30, price: 15, popular: true },
    { days: 90, price: 40, popular: false },
  ]

  const handleSubscribe = async () => {
    if (!authToken) {
      setError("Please login first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("https://nestfilm.hopto.org/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ days: selectedPlan }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.user)
        onClose()
      } else {
        setError(data.error || "Subscription failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-strong rounded-lg w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Subscribe</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <button
              key={plan.days}
              onClick={() => setSelectedPlan(plan.days)}
              className={`glass rounded-lg p-6 space-y-4 transition-all ${
                selectedPlan === plan.days ? "ring-2 ring-primary bg-primary/10" : "hover:bg-secondary"
              } ${plan.popular ? "relative" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.days} Days</h3>
                <p className="text-3xl font-bold text-primary">${plan.price}</p>
              </div>

              <ul className="space-y-2 text-sm text-left">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Unlimited streaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>HD quality</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Download content</span>
                </li>
              </ul>
            </button>
          ))}
        </div>

        {user && (
          <div className="glass rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">
              Current balance: <span className="text-foreground font-medium">${user.balance.toFixed(2)}</span>
            </p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          onClick={handleSubscribe}
          disabled={loading || !authToken}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {loading ? "Processing..." : `Subscribe for ${selectedPlan} days`}
        </Button>
      </div>
    </div>
  )
}
