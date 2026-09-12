"use client"

import { useState, useRef } from "react"
import {
  X,
  Sparkles,
  FileText,
  Lightbulb,
  BookOpen,
  Image as ImageIcon,
  FileCode,
  MoreHorizontal,
  Lock,
  Globe,
  UserCheck,
  Link2,
  Check,
  Tag as TagIcon,
  UploadCloud,
  Trash2,
  File
} from "lucide-react"

export type ContentTypeOption = "THOUGHT" | "NOTE" | "IDEA" | "ARTICLE" | "IMAGE" | "DOCUMENT" | "OTHER"
export type PrivacyOption = "PRIVATE" | "PUBLIC" | "PROFILE_ONLY" | "UNLISTED"

export interface UploadedFileItem {
  filename: string
  url: string
  mimeType: string
  size: number
}

interface CreateContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialType?: ContentTypeOption
}

const TYPE_CONFIG = [
  { id: "THOUGHT", label: "Thought", icon: Sparkles, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", desc: "A fleeting reflection or quick idea" },
  { id: "NOTE", label: "Note", icon: FileText, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", desc: "General information or reminder" },
  { id: "IDEA", label: "Idea", icon: Lightbulb, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", desc: "A project or concept to develop" },
  { id: "ARTICLE", label: "Article", icon: BookOpen, color: "text-purple-400 bg-purple-400/10 border-purple-400/20", desc: "In-depth longform writing or essay" },
  { id: "IMAGE", label: "Image", icon: ImageIcon, color: "text-rose-400 bg-rose-400/10 border-rose-400/20", desc: "Photo, mockup, or visual asset" },
  { id: "DOCUMENT", label: "Document", icon: FileCode, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", desc: "PDF, text file, or reference guide" },
  { id: "OTHER", label: "Other", icon: MoreHorizontal, color: "text-slate-400 bg-slate-400/10 border-slate-400/20", desc: "Any other personal information" },
]

export default function CreateContentModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = "NOTE"
}: CreateContentModalProps) {
  const [selectedType, setSelectedType] = useState<ContentTypeOption>(initialType)
  const [step, setStep] = useState<"SELECT_TYPE" | "EDITOR">("SELECT_TYPE")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("Personal")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [privacy, setPrivacy] = useState<PrivacyOption>("PRIVATE")
  const [isDraft, setIsDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleSelectType = (typeId: ContentTypeOption) => {
    setSelectedType(typeId)
    setStep("EDITOR")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError("")

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}`)
        }

        setUploadedFiles((prev) => [...prev, data])
      }
    } catch (err: any) {
      setError(err.message || "File upload failed.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const clean = tagInput.trim().replace(/^#/, "")
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = async (asDraftState?: boolean) => {
    setError("")
    if (!title.trim()) {
      setError("Please provide a title.")
      return
    }

    setIsSubmitting(true)
    const draftValue = asDraftState !== undefined ? asDraftState : isDraft

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          type: selectedType,
          category,
          privacyStatus: privacy,
          isDraft: draftValue,
          tags,
          files: uploadedFiles
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create content item.")
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message || "Something went wrong.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep("SELECT_TYPE")
    setTitle("")
    setContent("")
    setCategory("Personal")
    setTags([])
    setTagInput("")
    setPrivacy("PRIVATE")
    setIsDraft(false)
    setUploadedFiles([])
    setError("")
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            {step === "EDITOR" && (
              <button
                type="button"
                onClick={() => setStep("SELECT_TYPE")}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-colors"
              >
                ← Change Type
              </button>
            )}
            <h2 className="text-lg font-bold text-white">
              {step === "SELECT_TYPE" ? "What would you like to add?" : `New ${selectedType.toLowerCase()}`}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {step === "SELECT_TYPE" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TYPE_CONFIG.map((t) => {
                const IconComponent = t.icon
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectType(t.id as ContentTypeOption)}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-left transition-all group"
                  >
                    <div className={`p-3 rounded-xl border ${t.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors text-sm">
                        {t.label}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  placeholder="Give your thought or item a memorable title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Privacy Setting
                </label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as PrivacyOption)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="PRIVATE">🔒 Private (Only You)</option>
                  <option value="PUBLIC">🌍 Public (Visible to Anyone)</option>
                  <option value="PROFILE_ONLY">👤 Profile Only (On Public Profile)</option>
                  <option value="UNLISTED">🔗 Unlisted (Via Link Only)</option>
                </select>
              </div>

              {/* File / Image Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    Attach Image or Document (JPG, PNG, WEBP, PDF, DOCX, TXT)
                  </span>
                  <span className="text-[11px] text-slate-500">Max 10MB</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                />

                {/* Dropzone / Upload button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-950/80 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {isUploading ? "Uploading file..." : "Click to upload an image or document"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Supports JPG, PNG, WEBP, GIF, PDF, DOCX, TXT
                    </p>
                  </div>
                </div>

                {/* Uploaded Files Preview List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {file.mimeType.startsWith("image/") ? (
                            <img
                              src={file.url}
                              alt={file.filename}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                              <File className="w-6 h-6" />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-semibold text-white truncate">
                              {file.filename}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeUploadedFile(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Body Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Content & Details
                </label>
                <textarea
                  rows={5}
                  placeholder="Write your personal notes, descriptions, thoughts, or story here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5" /> Tags (Press Enter or comma to add)
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-950/80 border border-slate-800 rounded-xl min-h-[44px]">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-emerald-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "e.g. startup, inspiration, goals" : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[120px] bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none px-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "EDITOR" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/50">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || isUploading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || isUploading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Publish Item</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
