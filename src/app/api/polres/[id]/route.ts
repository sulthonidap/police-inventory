import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check authorization - only ADMIN, KORLANTAS, POLDA, and POLRES can access
    if (!["ADMIN", "KORLANTAS", "POLDA", "POLRES"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await context.params

    const polres = await prisma.polres.findUnique({
      where: { id },
      include: {
        polda: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            assets: true,
            reports: true,
          },
        },
      },
    })

    if (!polres) {
      return NextResponse.json(
        { error: "Polres tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(polres)
  } catch (error) {
    console.error("Error fetching polres:", error)
    return NextResponse.json(
      { error: "Failed to fetch polres" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, address, phone, poldaId } = body
    const { id } = await context.params

    if (!name) {
      return NextResponse.json(
        { error: 'Nama Polres harus diisi' },
        { status: 400 }
      )
    }

    if (!poldaId) {
      return NextResponse.json(
        { error: 'Polda harus dipilih' },
        { status: 400 }
      )
    }

    // Check if polres exists
    const existingPolres = await prisma.polres.findUnique({
      where: { id }
    })

    if (!existingPolres) {
      return NextResponse.json(
        { error: 'Polres tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if polda exists
    const polda = await prisma.polda.findUnique({
      where: { id: poldaId }
    })

    if (!polda) {
      return NextResponse.json(
        { error: 'Polda tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if another polres with same name in the same polda already exists
    const duplicatePolres = await prisma.polres.findFirst({
      where: {
        name: name,
        poldaId: poldaId,
        id: { not: id }
      }
    })

    if (duplicatePolres) {
      return NextResponse.json(
        { error: 'Polres dengan nama tersebut sudah ada di Polda yang sama' },
        { status: 400 }
      )
    }

    const updatedPolres = await prisma.polres.update({
      where: { id },
      data: { name, address, phone, poldaId },
      include: {
        polda: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            assets: true,
            reports: true,
          },
        },
      }
    })

    return NextResponse.json(updatedPolres)
  } catch (error) {
    console.error('Error updating polres:', error)
    return NextResponse.json(
      { error: 'Failed to update polres' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Check if polres exists
    const existingPolres = await prisma.polres.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            assets: true,
            reports: true,
          },
        },
      }
    })

    if (!existingPolres) {
      return NextResponse.json(
        { error: 'Polres tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if polres has associated users, assets, or reports
    if (existingPolres._count.users > 0 || existingPolres._count.assets > 0 || existingPolres._count.reports > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus Polres yang memiliki data terkait' },
        { status: 400 }
      )
    }

    await prisma.polres.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Polres berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting polres:', error)
    return NextResponse.json(
      { error: 'Failed to delete polres' },
      { status: 500 }
    )
  }
}
