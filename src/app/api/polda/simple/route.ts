import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
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
