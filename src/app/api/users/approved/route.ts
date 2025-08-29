import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export const preferredRegion = 'auto'

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        nrp: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching approved users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approved users' },
      { status: 500 }
    )
  }
}
