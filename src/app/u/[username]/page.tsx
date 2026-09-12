import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Globe,
  Calendar,
  Sparkles,
  BookOpen,
  Lightbulb,
  FileText,
  Image as ImageIcon,
  FileCode,
  Tag,
  ArrowLeft,
  Share2
} from "lucide-react"

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const cleanUsername = username.replace(/^@/, "").toLowerCase().trim()

  const profile = await prisma.profile.findUnique({
    where: { username: cleanUsername },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          contents: {
            where: {
              privacyStatus: { in: ["PUBLIC", "PROFILE_ONLY"] },
              isDraft: false,
              isArchived: false,
            },
            orderBy: { createdAt: "desc" },
            include: {
              tags: true,
              files: true,
            }
          }
        }
      }
    }
  })

  if (!profile || !profile.isPublic) {
    return notFound()
  }

  const user = profile.user
  const publicPosts = user.contents || []
  const interestsList = profile.interests
    ? profile.interests.split(",").map((s) => s.trim()).filter(Boolean)
    : []
  const skillsList = profile.skills
    ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const dateJoined = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-emerald-500/10 via-blue-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-2 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
          >
            Create Your Own Profile
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-emerald-500/20 shrink-0">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.name}
              </h1>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                @{profile.username}
              </p>
            </div>

            {profile.bio && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Joined {dateJoined}
              </span>
            </div>
          </div>
        </div>

        {/* About & Interests */}
        {(profile.aboutMe || interestsList.length > 0 || skillsList.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profile.aboutMe && (
              <div className="md:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  About
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {profile.aboutMe}
                </p>
              </div>
            )}

            <div className="space-y-6 bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
              {interestsList.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interestsList.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skillsList.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-medium border border-blue-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Public Content Items */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Shared Thoughts & Ideas ({publicPosts.length})
            </h2>
            <span className="text-xs text-slate-500">Publicly accessible items</span>
          </div>

          {publicPosts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-8">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                {user.name} hasn&apos;t shared any public notes or thoughts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {publicPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                        {post.type}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">
                      {post.title}
                    </h3>

                    {/* Attached Image Preview */}
                    {post.files && post.files.length > 0 && (
                      <div className="my-3 space-y-2">
                        {post.files.map((f: any) =>
                          f.mimeType?.startsWith("image/") ? (
                            <div key={f.id || f.url} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 max-h-48">
                              <img
                                src={f.url}
                                alt={f.filename}
                                className="w-full h-44 object-cover"
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

                    {post.content && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {post.content}
                      </p>
                    )}
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-slate-800/80">
                      {post.tags.map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded-md"
                        >
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
