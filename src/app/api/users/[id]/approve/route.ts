import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if user exists and is pending
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    if (user.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'User sudah tidak dalam status pending' },
        { status: 400 }
      )
    }

    // Approve user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'APPROVED' }
    })

    return NextResponse.json({
      message: 'User berhasil disetujui',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json(
      { error: 'Failed to approve user' },
      { status: 500 }
    )
  }
}
