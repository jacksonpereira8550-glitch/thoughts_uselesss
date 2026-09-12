import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        _count: {
          select: { contents: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure profile exists
    if (!user.profile) {
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: `user_${user.id.slice(0, 6)}`,
          bio: "Welcome to my digital profile.",
          isPublic: true
        }
      })
      user = { ...user, profile: newProfile }
    }

    // Calculate profile completion percentage
    const profile = user.profile
    const fields = [
      Boolean(user.name),
      Boolean(user.image),
      Boolean(profile?.bio),
      Boolean(profile?.aboutMe),
      Boolean(profile?.interests),
      Boolean(profile?.skills),
      Boolean(profile?.location),
      Boolean(profile?.website),
    ]
    const completedCount = fields.filter(Boolean).length
    const completionPercentage = Math.round((completedCount / fields.length) * 100)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        contentCount: user._count.contents,
        profile: user.profile,
        completionPercentage,
      }
    })
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, image, bio, aboutMe, interests, skills, location, website, isPublic, username } = body

    // Update user info
    if (name !== undefined || image !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name !== undefined && { name }),
          ...(image !== undefined && { image })
        }
      })
    }

    // Check if username is being changed and if it's already taken
    if (username) {
      const cleanUsername = username.toLowerCase().trim()
      const existing = await prisma.profile.findFirst({
        where: {
          username: cleanUsername,
          userId: { not: session.user.id }
        }
      })
      if (existing) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 400 })
      }
    }

    // Update profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        username: username?.toLowerCase().trim() || `user_${session.user.id.slice(0, 6)}`,
        bio: bio || "",
        aboutMe: aboutMe || "",
        interests: interests || "",
        skills: skills || "",
        location: location || "",
        website: website || "",
        isPublic: isPublic ?? true,
      },
      update: {
        ...(username !== undefined && { username: username.toLowerCase().trim() }),
        ...(bio !== undefined && { bio }),
        ...(aboutMe !== undefined && { aboutMe }),
        ...(interests !== undefined && { interests }),
        ...(skills !== undefined && { skills }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(isPublic !== undefined && { isPublic }),
      }
    })

    return NextResponse.json({ profile, message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile PATCH error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
