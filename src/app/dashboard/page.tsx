"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import CreateContentModal, { ContentTypeOption, PrivacyOption } from "@/components/dashboard/create-content-modal"
import {
  Sparkles,
  Search,
  Plus,
  Lock,
  Globe,
  User,
  Link2,
  Trash2,
  Edit3,
  Star,
  FileText,
  Lightbulb,
  BookOpen,
  Image as ImageIcon,
  FileCode,
  MoreHorizontal,
  Calendar,
  Tag as TagIcon,
  Folder,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Filter
} from "lucide-react"

interface ContentItem {
  id: string
  title: string
  content: string | null
  type: ContentTypeOption
  category: string | null
  privacyStatus: PrivacyOption
  isDraft: boolean
  isFavorite: boolean
  createdAt: string
  tags: { id: string; name: string }[]
  files?: { id: string; filename: string; url: string; mimeType: string; size: number }[]
}

interface ProfileData {
  completionPercentage: number
  profile: {
    username: string
    isPublic: boolean
  }
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const typeParam = searchParams.get("type") || "ALL"
  const filterParam = searchParams.get("filter") || "ALL"

  const [items, setItems] = useState<ContentItem[]>([])
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [selectedType, setSelectedType] = useState(typeParam)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Debounce search query to prevent rapid-fire requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchContent = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setIsLoading(true)
    try {
      let url = `/api/content?type=${selectedType}&category=${selectedCategory}`
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`
      if (filterParam !== "ALL") url += `&filter=${filterParam}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedType, selectedCategory, debouncedSearch, filterParam])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile")
      if (res.ok) {
        const data = await res.json()
        setProfileData(data.user)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchContent(false)
      fetchProfile()
    }
  }, [status, fetchContent, fetchProfile])

  // Listen for custom content-created events from the sidebar
  useEffect(() => {
    const handleCreated = () => {
      fetchContent()
      fetchProfile()
    }
    window.addEventListener("content-created", handleCreated)
    return () => window.removeEventListener("content-created", handleCreated)
  }, [fetchContent, fetchProfile])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id))
        setDeleteConfirmId(null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const toggleFavorite = async (item: ContentItem) => {
    const newFav = !item.isFavorite
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isFavorite: newFav } : i))
    )
    try {
      await fetch(`/api/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: newFav })
      })
    } catch (err) {
      console.error(err)
    }
  }

  const togglePrivacy = async (item: ContentItem) => {
    const nextPrivacy: PrivacyOption =
      item.privacyStatus === "PRIVATE"
        ? "PUBLIC"
        : item.privacyStatus === "PUBLIC"
        ? "PROFILE_ONLY"
        : "PRIVATE"

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, privacyStatus: nextPrivacy } : i))
    )
    try {
      await fetch(`/api/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacyStatus: nextPrivacy })
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Count stats
  const totalCount = items.length
  const privateCount = items.filter((i) => i.privacyStatus === "PRIVATE").length
  const publicCount = items.filter((i) => i.privacyStatus === "PUBLIC").length
  const draftCount = items.filter((i) => i.isDraft).length

  const getTypeIcon = (type: ContentTypeOption) => {
    switch (type) {
      case "THOUGHT":
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      case "NOTE":
        return <FileText className="w-3.5 h-3.5 text-blue-400" />
      case "IDEA":
        return <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
      case "ARTICLE":
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />
      case "IMAGE":
        return <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
      case "DOCUMENT":
        return <FileCode className="w-3.5 h-3.5 text-cyan-400" />
      default:
        return <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  const getPrivacyBadge = (status: PrivacyOption) => {
    switch (status) {
      case "PUBLIC":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Globe className="w-3 h-3" /> Public
          </span>
        )
      case "PROFILE_ONLY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <User className="w-3 h-3" /> Profile Only
          </span>
        )
      case "UNLISTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Link2 className="w-3 h-3" /> Unlisted
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-3 h-3" /> Private
          </span>
        )
    }
  }

  if (status === "loading") {
    return (
      <DashboardNav>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </DashboardNav>
    )
  }

  return (
    <DashboardNav>
      <div className="space-y-8">
        {/* Top Welcome Header */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {session?.user?.name || "Friend"}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here is what is happening in your personal knowledge space today.
          </p>
        </div>

        {/* Profile Completion & Storage Overview Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Completion Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Profile Setup</span>
              <span className="font-bold text-emerald-400">
                {profileData?.completionPercentage ?? 50}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileData?.completionPercentage ?? 50}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {(profileData?.completionPercentage ?? 50) < 100
                ? "Complete your bio & skills to polish your profile."
                : "Your profile is fully completed!"}
            </p>
          </div>

          {/* Private Vault Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Private Items</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{privateCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Visible only to you</p>
          </div>

          {/* Public Posts Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Public Content</span>
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{publicCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Shared on your public profile</p>
          </div>

          {/* Storage Usage Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Storage Used</span>
              <HardDrive className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">1.2 MB</p>
            <p className="text-[11px] text-slate-400 mt-1">Free plan (2 GB limit)</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, keywords, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Personal">Personal</option>
                <option value="Work & Projects">Work & Projects</option>
                <option value="Learning & Study">Learning & Study</option>
                <option value="Creative & Writing">Creative & Writing</option>
                <option value="Health & Habits">Health & Habits</option>
                <option value="Finance">Finance</option>
                <option value="Reference">Reference</option>
              </select>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {["ALL", "THOUGHT", "NOTE", "IDEA", "ARTICLE", "IMAGE", "DOCUMENT"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedType === t
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-3xl bg-slate-900/40 border border-slate-800/60 animate-pulse p-6"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Your vault is ready</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              You haven&apos;t uploaded any {selectedType === "ALL" ? "content" : selectedType.toLowerCase()} yet.
              Capture your first idea or note now!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between transition-all group shadow-sm hover:shadow-xl hover:shadow-black/20"
              >
                <div>
                  {/* Top Bar: Type & Privacy & Favorite */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {item.type}
                      </span>
                      {item.isDraft && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          DRAFT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => togglePrivacy(item)}
                        title="Click to toggle privacy setting"
                        className="hover:scale-105 transition-transform"
                      >
                        {getPrivacyBadge(item.privacyStatus)}
                      </button>
                      <button
                        onClick={() => toggleFavorite(item)}
                        className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                          item.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? "fill-amber-400" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Attached Image Preview */}
                  {item.files && item.files.length > 0 && (
                    <div className="my-3 space-y-2">
                      {item.files.map((f) =>
                        f.mimeType.startsWith("image/") ? (
                          <div key={f.id || f.url} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 max-h-48">
                            <img
                              src={f.url}
                              alt={f.filename}
                              className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <a
                            key={f.id || f.url}
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-emerald-400 transition-colors"
                          >
                            <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="truncate flex-1 font-medium">{f.filename}</span>
                          </a>
                        )
                      )}
                    </div>
                  )}

                  {item.content && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  )}
                </div>

                {/* Bottom Bar: Tags & Metadata & Delete */}
                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md">
                        <Folder className="w-3 h-3 text-slate-500" />
                        {item.category}
                      </span>
                    )}
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[10px] text-emerald-400/80 bg-emerald-500/5 px-1.5 py-0.5 rounded"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-lg border border-rose-500/20">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 px-1.5 py-0.5"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[10px] text-slate-400 hover:text-white px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      <CreateContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchContent()
          fetchProfile()
        }}
      />
    </DashboardNav>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-400 p-8">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
