import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
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
