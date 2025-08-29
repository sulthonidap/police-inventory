import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const poldaId = searchParams.get('poldaId') || undefined

    const polres = await prisma.polres.findMany({
      where: poldaId ? { poldaId } : undefined,
      select: {
        id: true,
        name: true,
        polda: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(polres)
  } catch (error) {
    console.error('Error fetching polres:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polres' },
      { status: 500 }
    )
  }
}
