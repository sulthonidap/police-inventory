import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
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
    console.error('Error approving user:', error)
    return NextResponse.json(
      { error: 'Failed to approve user' },
      { status: 500 }
    )
  }
}
