import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const count = await prisma.user.count({
      where: {
        status: 'PENDING'
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting pending users:', error)
    return NextResponse.json(
      { error: 'Failed to count pending users' },
      { status: 500 }
    )
  }
}
