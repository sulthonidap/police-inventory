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
    console.log('🔍 API: Fetching polres with ID:', params.id)
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('❌ API: No session found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('✅ API: Session found, user role:', session.user.role)

    // Check authorization - ADMIN, KORLANTAS, POLDA, POLRES, USER can access
    if (!["ADMIN", "KORLANTAS", "POLDA", "POLRES", "USER"].includes(session.user.role)) {
      console.log('❌ API: User role not authorized:', session.user.role)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params
    console.log('🔍 API: Looking for polres with ID:', id)

    // Role-based access control
    let whereClause: any = { id }
    
    if (session.user.role === 'POLDA' && session.user.poldaId) {
      // POLDA can only access Polres from their Polda
      whereClause = { id, poldaId: session.user.poldaId }
    } else if (session.user.role === 'POLRES' && session.user.polresId) {
      // POLRES can only access their own Polres
      whereClause = { id: session.user.polresId }
    } else if (session.user.role === 'USER' && session.user.polresId) {
      // USER can only access their Polres
      whereClause = { id: session.user.polresId }
    }
    // ADMIN and KORLANTAS can access any Polres

    const polres = await prisma.polres.findUnique({
      where: whereClause,
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
      console.log('❌ API: Polres not found with ID:', id)
      return NextResponse.json(
        { error: "Polres tidak ditemukan" },
        { status: 404 }
      )
    }

    console.log('✅ API: Polres found:', polres.name)
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, address, phone, poldaId } = body

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
      where: { id: params.id }
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
        { status: 400 }
      )
    }

    // Check if another polres with same name already exists in the same polda
    const duplicatePolres = await prisma.polres.findFirst({
      where: {
        name: name,
        poldaId: poldaId,
        id: { not: params.id }
      }
    })

    if (duplicatePolres) {
      return NextResponse.json(
        { error: 'Polres dengan nama tersebut sudah ada di Polda ini' },
        { status: 400 }
      )
    }

    const updatedPolres = await prisma.polres.update({
      where: { id: params.id },
      data: { name, address, phone, poldaId },
      include: {
        polda: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            users: true,
            assets: true
          }
        }
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
  { params }: { params: { id: string } }
) {
  try {
    // Check if polres exists
    const existingPolres = await prisma.polres.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
            assets: true
          }
        }
      }
    })

    if (!existingPolres) {
      return NextResponse.json(
        { error: 'Polres tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if polres has associated users or assets
    if (existingPolres._count.users > 0 || existingPolres._count.assets > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus Polres yang memiliki User atau Asset terkait' },
        { status: 400 }
      )
    }

    await prisma.polres.delete({
      where: { id: params.id }
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
