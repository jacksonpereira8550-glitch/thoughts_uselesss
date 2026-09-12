"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import {
  User,
  AtSign,
  MapPin,
  Globe,
  Sparkles,
  Award,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Eye
} from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    image: "",
    bio: "",
    aboutMe: "",
    interests: "",
    skills: "",
    location: "",
    website: "",
    isPublic: true,
  })
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const [dateJoined, setDateJoined] = useState<string>("")
  const [completionPercentage, setCompletionPercentage] = useState<number>(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          const u = data.user
          setFormData({
            name: u.name || "",
            username: u.profile?.username || "",
            image: u.image || "",
            bio: u.profile?.bio || "",
            aboutMe: u.profile?.aboutMe || "",
            interests: u.profile?.interests || "",
            skills: u.profile?.skills || "",
            location: u.profile?.location || "",
            website: u.profile?.website || "",
            isPublic: u.profile?.isPublic ?? true,
          })
          if (u.createdAt) {
            setDateJoined(new Date(u.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            }))
          }
          setCompletionPercentage(u.completionPercentage || 0)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      loadProfile()
    }
  }, [status])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingPhoto(true)
    setErrorMessage("")
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to upload photo")
      setFormData((prev) => ({ ...prev, image: data.url }))
      setSuccessMessage("Photo uploaded! Click Save Changes to apply.")
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload photo.")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.")
      }

      setSuccessMessage("Your profile has been saved successfully!")
      // Refresh profile state
      const refreshRes = await fetch("/api/profile")
      if (refreshRes.ok) {
        const refreshed = await refreshRes.json()
        setCompletionPercentage(refreshed.user.completionPercentage || 0)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Profile
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Customize how you present yourself and your ideas to the world.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {formData.username && (
              <a
                href={`/u/${formData.username}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Public Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Card Preview & Completion */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border border-emerald-500/30 shadow-xl shadow-emerald-500/20"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  {formData.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <label className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer transition-opacity backdrop-blur-xs">
                <span>Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <label className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer">
              {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {formData.name || "Your Name"}
            </h2>
            <p className="text-sm text-emerald-400 font-medium mt-0.5">
              @{formData.username || "username"}
            </p>
            <p className="text-xs text-slate-400 mt-2 line-clamp-2">
              {formData.bio || "No short bio added yet."}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-500">
              {formData.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {formData.location}
                </span>
              )}
              {dateJoined && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {dateJoined}
                </span>
              )}
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                {completionPercentage}% complete
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Your Full Name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-slate-500" /> Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  })
                }
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="yourusername"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Short Bio (Max 160 characters)
            </label>
            <input
              type="text"
              maxLength={160}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="A brief introduction or summary about what you do..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              About Me (Detailed Background & Story)
            </label>
            <textarea
              rows={4}
              value={formData.aboutMe}
              onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"
              placeholder="Share more about your journey, philosophy, work, or what inspires you..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Interests (Comma separated)
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="AI, Philosophy, Design, Writing"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-500" /> Skills (Comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Product Design, TypeScript, Public Speaking"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="San Francisco, CA / Remote"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" /> Website or Social Link (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Public Profile Status</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Allow visitors to view your public profile at saidalis.com/u/{formData.username || "username"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                formData.isPublic ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.isPublic ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardNav>
  )
}
