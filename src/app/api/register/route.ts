import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, username, email, password } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanUsername = (username || name.toLowerCase().replace(/[^a-z0-9_]/g, "")).toLowerCase().trim()

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      )
    }

    // Check if username is already taken
    if (cleanUsername) {
      const existingProfile = await prisma.profile.findUnique({
        where: { username: cleanUsername }
      })

      if (existingProfile) {
        return NextResponse.json(
          { error: "This username is already taken. Please choose another." },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        profile: {
          create: {
            username: cleanUsername || `user_${Math.floor(1000 + Math.random() * 9000)}`,
            bio: "Exploring ideas, writing thoughts, and sharing knowledge.",
            aboutMe: "Welcome to my personal digital space.",
            isPublic: true,
          }
        }
      },
      include: {
        profile: true
      }
    })

    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.profile?.username
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create account. Please try again." },
      { status: 500 }
    )
  }
}
