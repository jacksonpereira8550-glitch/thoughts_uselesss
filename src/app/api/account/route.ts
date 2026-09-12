import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User account not found or cannot change password." },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentValid && user.password !== currentPassword) {
      return NextResponse.json(
        { error: "Current password does not match our records." },
        { status: 400 }
      )
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({ message: "Password updated successfully." })
  } catch (error: any) {
    console.error("Password update error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to update password." },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
    }

    // Delete user (cascades to profile, contentItems, sessions, accounts)
    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({ message: "Account deleted successfully." })
  } catch (error: any) {
    console.error("Account deletion error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to delete account." },
      { status: 500 }
    )
  }
}
