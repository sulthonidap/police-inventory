import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Konfigurasi untuk Vercel deployment

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const poldas = await prisma.polda.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(poldas)
  } catch (error) {
    console.error('Error fetching poldas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch poldas' },
      { status: 500 }
    )
  }
}
