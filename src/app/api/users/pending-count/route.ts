import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
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
