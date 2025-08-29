import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check authorization - only ADMIN, KORLANTAS, and POLDA can access
    if (!["ADMIN", "KORLANTAS", "POLDA"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    const polda = await prisma.polda.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            polres: true,
            users: true,
            assets: true,
            reports: true,
          },
        },
      },
    })

    if (!polda) {
      return NextResponse.json(
        { error: "Polda tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(polda)
  } catch (error) {
    console.error("Error fetching polda:", error)
    return NextResponse.json(
      { error: "Failed to fetch polda" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, address, phone } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nama Polda harus diisi' },
        { status: 400 }
      )
    }

    // Check if polda exists
    const existingPolda = await prisma.polda.findUnique({
      where: { id: params.id }
    })

    if (!existingPolda) {
      return NextResponse.json(
        { error: 'Polda tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if another polda with same name already exists
    const duplicatePolda = await prisma.polda.findFirst({
      where: {
        name: name,
        id: { not: params.id }
      }
    })

    if (duplicatePolda) {
      return NextResponse.json(
        { error: 'Polda dengan nama tersebut sudah ada' },
        { status: 400 }
      )
    }

    const updatedPolda = await prisma.polda.update({
      where: { id: params.id },
      data: { name, address, phone },
      include: {
        _count: {
          select: {
            polres: true
          }
        }
      }
    })

    return NextResponse.json(updatedPolda)
  } catch (error) {
    console.error('Error updating polda:', error)
    return NextResponse.json(
      { error: 'Failed to update polda' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if polda exists
    const existingPolda = await prisma.polda.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            polres: true
          }
        }
      }
    })

    if (!existingPolda) {
      return NextResponse.json(
        { error: 'Polda tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if polda has associated polres
    if (existingPolda._count.polres > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus Polda yang memiliki Polres terkait' },
        { status: 400 }
      )
    }

    await prisma.polda.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Polda berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting polda:', error)
    return NextResponse.json(
      { error: 'Failed to delete polda' },
      { status: 500 }
    )
  }
}
