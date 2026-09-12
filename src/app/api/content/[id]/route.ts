import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const item = await prisma.contentItem.findUnique({
      where: { id },
      include: {
        files: true,
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                username: true
              }
            }
          }
        }
      }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Check privacy
    const isOwner = session?.user?.id === item.userId
    if (!isOwner) {
      if (item.privacyStatus === "PRIVATE") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
      if (item.isDraft) {
        return NextResponse.json({ error: "Item is not published" }, { status: 403 })
      }
    }

    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.contentItem.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to update this item" }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, type, category, privacyStatus, isDraft, isFavorite, isArchived } = body

    const updated = await prisma.contentItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type: type.toUpperCase() }),
        ...(category !== undefined && { category }),
        ...(privacyStatus !== undefined && { privacyStatus }),
        ...(isDraft !== undefined && { isDraft: Boolean(isDraft) }),
        ...(isFavorite !== undefined && { isFavorite: Boolean(isFavorite) }),
        ...(isArchived !== undefined && { isArchived: Boolean(isArchived) }),
      },
      include: {
        tags: true,
        files: true
      }
    })

    return NextResponse.json({ item: updated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.contentItem.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this item" }, { status: 403 })
    }

    await prisma.contentItem.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
