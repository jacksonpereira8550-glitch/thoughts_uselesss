"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  User,
  Sparkles,
  UploadCloud,
  FolderTree,
  Star,
  FileEdit,
  Settings,
  Plus,
  LogOut,
  ExternalLink,
  ChevronDown,
  Menu,
  X
} from "lucide-react"
import CreateContentModal from "./create-content-modal"

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/profile", icon: User },
  { name: "My Thoughts", href: "/dashboard?type=THOUGHT", icon: Sparkles },
  { name: "My Uploads", href: "/dashboard?type=DOCUMENT", icon: UploadCloud },
  { name: "Favorites", href: "/dashboard?filter=favorites", icon: Star },
  { name: "Drafts", href: "/dashboard?filter=drafts", icon: FileEdit },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const username = (session?.user as any)?.username || "me"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Create Modal */}
      <CreateContentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          // Trigger a refresh event for content components
          window.dispatchEvent(new Event("content-created"))
        }}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-xl p-5 shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-2 py-3 mb-6 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
            S
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block group-hover:text-emerald-400 transition-colors">
              Personal Space
            </span>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
              Knowledge Vault
            </span>
          </div>
        </Link>

        {/* Action Button: + Add New */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full py-3 px-4 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all group active:scale-[0.98]"
        >
          <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm">+ Add New</span>
        </button>

        {/* Navigation links */}
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-800/90 text-emerald-400 font-semibold shadow-sm border border-slate-700/60"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Card */}
        <div className="pt-4 border-t border-slate-800/80 mt-auto">
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">
                    {session?.user?.name || "Member"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    @{username}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                <Link
                  href={`/u/${username}`}
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <span>Public Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Settings
                </Link>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center text-white font-black text-xs">
            S
          </div>
          <span className="font-bold text-sm text-white">Personal Space</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 sticky top-[61px] z-30">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-rose-400 flex items-center gap-2 px-3 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
