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

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const filter = searchParams.get("filter") // drafts, favorites, public, private

    const where: any = {
      userId: session.user.id,
      isArchived: false,
    }

    if (type && type !== "ALL") {
      where.type = type
    }

    if (category && category !== "ALL") {
      where.category = category
    }

    if (filter === "drafts") {
      where.isDraft = true
    } else if (filter === "favorites") {
      where.isFavorite = true
    } else if (filter === "public") {
      where.privacyStatus = "PUBLIC"
    } else if (filter === "private") {
      where.privacyStatus = "PRIVATE"
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { category: { contains: search } }
      ]
    }

    const items = await prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        files: true,
        tags: true,
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Content GET error:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      content,
      type = "NOTE",
      category = "General",
      privacyStatus = "PRIVATE",
      isDraft = false,
      tags = [],
      files = []
    } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Process tags
    const tagConnectOrCreate = Array.isArray(tags)
      ? tags.filter(Boolean).map((tagName: string) => ({
          where: { name: tagName.trim().toLowerCase() },
          create: { name: tagName.trim().toLowerCase() }
        }))
      : []

    // Process file attachments
    const filesCreate = Array.isArray(files)
      ? files.map((f: any) => ({
          filename: f.filename,
          url: f.url,
          mimeType: f.mimeType || "application/octet-stream",
          size: f.size || 0
        }))
      : []

    const newItem = await prisma.contentItem.create({
      data: {
        userId: session.user.id,
        title,
        content: content || "",
        type: type.toUpperCase(),
        category: category || "General",
        privacyStatus: privacyStatus || "PRIVATE",
        isDraft: Boolean(isDraft),
        tags: {
          connectOrCreate: tagConnectOrCreate
        },
        files: {
          create: filesCreate
        }
      },
      include: {
        tags: true,
        files: true
      }
    })

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (error) {
    console.error("Content POST error:", error)
    return NextResponse.json({ error: "Failed to create content item" }, { status: 500 })
  }
}
