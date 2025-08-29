import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Konfigurasi untuk Vercel deployment

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30

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

    // Reject user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' }
    })

    return NextResponse.json({
      message: 'User berhasil ditolak',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json(
      { error: 'Failed to reject user' },
      { status: 500 }
    )
  }
}
