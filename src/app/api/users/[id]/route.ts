import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Konfigurasi untuk Vercel deployment

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user has associated assets or reports
    const userWithRelations = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assets: true,
            reports: true,
          },
        },
      },
    })

    if (userWithRelations!._count.assets > 0 || userWithRelations!._count.reports > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus User yang memiliki Asset atau Report terkait' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
