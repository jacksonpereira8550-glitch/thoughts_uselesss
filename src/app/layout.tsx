import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import SessionProvider from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Personal Space — Thoughts, Ideas & Digital Profile",
  description: "Create your personal space to store, organize and share the ideas and information that matter to you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
