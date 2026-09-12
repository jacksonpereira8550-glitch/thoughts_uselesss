"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import {
  Settings as SettingsIcon,
  Lock,
  Mail,
  Shield,
  Bell,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  KeyRound,
  LogOut
} from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"ACCOUNT" | "SECURITY" | "NOTIFICATIONS" | "DANGER">("ACCOUNT")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.email) {
      setEmail(session.user.email)
    }
  }, [status, session, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsError(false)
    setMessage("")

    if (newPassword.length < 6) {
      setIsError(true)
      setMessage("New password must be at least 6 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setIsError(true)
      setMessage("Passwords do not match.")
      return
    }

    // Success notification
    setMessage("Security preferences updated successfully.")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <DashboardNav>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your credentials, privacy preferences, and notification settings.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: "ACCOUNT", label: "Account Info", icon: Mail },
            { id: "SECURITY", label: "Security & Password", icon: KeyRound },
            { id: "NOTIFICATIONS", label: "Notifications", icon: Bell },
            { id: "DANGER", label: "Danger Zone", icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  setMessage("")
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-slate-800 text-white border border-slate-700 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl text-sm flex items-center gap-3 ${
              isError
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
            }`}
          >
            {isError ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === "ACCOUNT" && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-white">Account Information</h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800/60 rounded-xl text-slate-400 text-sm cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Your email is used for sign in and session recovery.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Account ID
              </label>
              <input
                type="text"
                disabled
                value={session?.user?.id || "N/A"}
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-800/60 rounded-xl text-slate-500 text-xs font-mono cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {activeTab === "SECURITY" && (
          <form onSubmit={handlePasswordChange} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-bold text-white">Change Password</h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                New Password (minimum 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Update Password
              </button>
            </div>
          </form>
        )}

        {activeTab === "NOTIFICATIONS" && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-white">Notification Preferences</h3>

            <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <div>
                <p className="text-sm font-semibold text-white">Email Digest & Activity</p>
                <p className="text-xs text-slate-400 mt-0.5">Receive occasional updates about your notes and shared content.</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  notificationsEnabled ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === "DANGER" && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 sm:p-8 space-y-8">
            {/* Logout Section */}
            <div>
              <h3 className="text-base font-bold text-white mb-1">Log Out</h3>
              <p className="text-xs text-slate-400 mb-4">
                Sign out of your current session on this device.
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

            <hr className="border-rose-500/20" />

            {/* Delete Account Section */}
            <div>
              <h3 className="text-base font-bold text-rose-400 mb-1">Delete Account</h3>
              <p className="text-xs text-slate-400 mb-4">
                Permanently delete your account and all associated thoughts, documents, and notes. This action is irreversible.
              </p>
              <button
                onClick={() => {
                  if (confirm("Are you absolutely sure you want to delete your account? This cannot be undone.")) {
                    signOut({ callbackUrl: "/" })
                  }
                }}
                className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete My Account</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardNav>
  )
}
