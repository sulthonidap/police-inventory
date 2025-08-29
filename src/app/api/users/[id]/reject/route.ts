import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: 'REJECTED' },
      include: {
        polres: {
          select: {
            name: true,
            polda: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json(
      { error: 'Failed to reject user' },
      { status: 500 }
    )
  }
}
