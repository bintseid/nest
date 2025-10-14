"use client"

import { useState } from "react"
import { X, Phone, Mail, MapPin, Clock, CreditCard, User, Shield, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User as UserType } from "./streaming-app"

interface ContactPageProps {
  user: UserType | null
  onClose: () => void
  onLogout: () => void
  onSubscribeClick: () => void
  onLoginClick: () => void
}

export function ContactPage({ user, onClose, onLogout, onSubscribeClick, onLoginClick }: ContactPageProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "contact" | "support">("profile")

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="glass-strong rounded-xl w-full max-w-md p-8 space-y-6 border border-[#1a88f0]/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white">
                Welcome
              </h2>
              <p className="text-sm text-white">Sign in to access your profile</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-[#1a88f0] p-2 rounded-lg hover:bg-[#252538]/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center space-y-6">
            <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto border border-[#1a88f0]/50">
              <User className="w-10 h-10 text-[#1a88f0]" />
            </div>
            
            <div className="space-y-4">
              <p className="text-white">
                Please login to view your profile, account balance, and contact information.
              </p>
              
              <Button
                onClick={onLoginClick}
                variant="glass"
                className="w-full border-[#1a88f0] py-3 text-lg font-semibold rounded-lg"
              >
                <User className="w-5 h-5 mr-2" />
                Login to Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "contact" as const, label: "Contact", icon: Phone },
    { id: "support" as const, label: "Support", icon: HelpCircle },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-strong rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#1a88f0]/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a88f0]/30">
          <h2 className="text-2xl font-bold text-white">
            Account & Contact
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-[#1a88f0] p-2 rounded-lg hover:bg-[#252538]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a88f0]/30">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#1a88f0] border-b-2 border-[#1a88f0]"
                    : "text-white hover:text-[#1a88f0]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1a88f0]/50">
                  <User className="w-10 h-10 text-[#1a88f0]" />
                </div>
                <h3 className="text-xl font-semibold text-white">{user?.phone}</h3>
                <p className="text-[#1a88f0]">Premium Member</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-lg p-4 border border-[#1a88f0]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-[#1a88f0]" />
                    <span className="font-medium text-white">Account Balance</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1a88f0]">${user?.balance.toFixed(2)}</p>
                </div>

                <div className="glass rounded-lg p-4 border border-[#1a88f0]/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-[#1a88f0]" />
                    <span className="font-medium text-white">Subscription</span>
                  </div>
                  {user?.subscription_end ? (
                    <div>
                      <p className="text-white font-semibold">Active</p>
                      <p className="text-sm text-white">
                        Until {new Date(user.subscription_end).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-white">No Active Subscription</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={onSubscribeClick}
                  variant="glass"
                  className="flex-1 border-[#1a88f0]"
                >
                  Manage Subscription
                </Button>
                <Button
                  onClick={onLogout}
                  variant="glass"
                  className="flex-1 border-[#1a88f0]"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Get in Touch</h3>
                <p className="text-white">We're here to help you with any questions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-lg p-6 text-center border border-[#1a88f0]/30">
                  <Phone className="w-8 h-8 text-[#1a88f0] mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Phone Support</h4>
                  <p className="text-white mb-3">24/7 Customer Service</p>
                  <p className="text-lg font-mono text-white">+251 911 234 567</p>
                </div>

                <div className="glass rounded-lg p-6 text-center border border-[#1a88f0]/30">
                  <Mail className="w-8 h-8 text-[#1a88f0] mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Email Support</h4>
                  <p className="text-white mb-3">Response within 2 hours</p>
                  <p className="text-sm text-white">support@nestfilm.com</p>
                </div>

                <div className="glass rounded-lg p-6 text-center border border-[#1a88f0]/30">
                  <MapPin className="w-8 h-8 text-[#1a88f0] mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Office Location</h4>
                  <p className="text-white mb-3">Visit our office</p>
                  <p className="text-sm text-white">Addis Ababa, Ethiopia</p>
                </div>

                <div className="glass rounded-lg p-6 text-center border border-[#1a88f0]/30">
                  <Clock className="w-8 h-8 text-[#1a88f0] mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Business Hours</h4>
                  <p className="text-white mb-3">Monday - Friday</p>
                  <p className="text-sm text-white">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Help & Support</h3>
                <p className="text-white">Find answers to common questions</p>
              </div>

              <div className="space-y-4">
                <div className="glass rounded-lg p-4 border border-[#1a88f0]/30">
                  <h4 className="font-semibold text-white mb-2">How to Subscribe?</h4>
                  <p className="text-sm text-white">
                    Click "Manage Subscription" to upgrade your account and access premium content.
                  </p>
                </div>

                <div className="glass rounded-lg p-4 border border-[#1a88f0]/30">
                  <h4 className="font-semibold text-white mb-2">Video Not Playing?</h4>
                  <p className="text-sm text-white">
                    Check your internet connection and try refreshing the page. Contact support if issues persist.
                  </p>
                </div>

                <div className="glass rounded-lg p-4 border border-[#1a88f0]/30">
                  <h4 className="font-semibold text-white mb-2">Payment Issues?</h4>
                  <p className="text-sm text-white">
                    Ensure you have sufficient balance. Contact our support team for payment assistance.
                  </p>
                </div>

                <div className="glass rounded-lg p-4 border border-[#1a88f0]/30">
                  <h4 className="font-semibold text-white mb-2">Account Security</h4>
                  <p className="text-sm text-white">
                    Keep your login credentials secure. Never share your account details with others.
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={() => window.open('mailto:support@nestfilm.com', '_blank')}
                  variant="glass"
                  className="border-[#1a88f0]"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
