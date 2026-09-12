import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
      <main className="max-w-5xl w-full text-center space-y-12 py-20">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            Your thoughts.<br />Your information.<br />Your digital profile.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
            Create your personal space to store, organize and share the ideas and information that matter to you.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-emerald-500/25">
            Create Your Profile
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold text-lg transition-all border border-slate-700">
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-32">
          <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Create your profile</h3>
            <p className="text-slate-400 leading-relaxed">Build a beautiful public or private digital presence that represents you perfectly.</p>
          </div>
          
          <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Upload your thoughts</h3>
            <p className="text-slate-400 leading-relaxed">Store notes, ideas, images, and documents in a centralized personal vault.</p>
          </div>

          <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Keep it secure</h3>
            <p className="text-slate-400 leading-relaxed">Granular privacy controls mean you decide exactly what to share and what stays private.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
