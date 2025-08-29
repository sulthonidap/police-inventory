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

    const { id } = await context.params

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        categoryRef: {
          select: {
            id: true,
            name: true,
          },
        },
        polres: {
          select: {
            id: true,
            name: true,
            polda: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Asset tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Error fetching asset:", error)
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, categoryId, polresId, userId, status, kind, categoryLevel1, categoryLevel2, categoryLevel3, source, inventoryNumber, year, poldaId, qrData } = body
    const { id } = await context.params

    if (!name) {
      return NextResponse.json(
        { error: 'Nama asset harus diisi' },
        { status: 400 }
      )
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Kategori harus dipilih' },
        { status: 400 }
      )
    }

    if (!polresId) {
      return NextResponse.json(
        { error: 'Polres harus dipilih' },
        { status: 400 }
      )
    }

    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id }
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if polres exists
    const polres = await prisma.polres.findUnique({
      where: { id: polresId }
    })

    if (!polres) {
      return NextResponse.json(
        { error: 'Polres tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user exists (if provided)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    // Check if inventory number is unique (if provided)
    if (inventoryNumber) {
      const duplicateAsset = await prisma.asset.findFirst({
        where: {
          inventoryNumber: inventoryNumber,
          id: { not: id }
        }
      })

      if (duplicateAsset) {
        return NextResponse.json(
          { error: 'Inventory number sudah digunakan oleh asset lain' },
          { status: 400 }
        )
      }
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        categoryId,
        polresId,
        assignedTo: userId || null,
        status,
        kind,
        categoryLevel1,
        categoryLevel2,
        categoryLevel3,
        source,
        inventoryNumber,
        year: year ? parseInt(year) : null,
        poldaId,
        qrData,
      },
      include: {
        categoryRef: {
          select: {
            id: true,
            name: true,
          },
        },
        polres: {
          select: {
            id: true,
            name: true,
            polda: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }
    })

    return NextResponse.json(updatedAsset)
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { error: 'Failed to update asset' },
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
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id }
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if asset is assigned to a user
    if (existingAsset.assignedTo) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus Asset yang sedang digunakan oleh User' },
        { status: 400 }
      )
    }

    await prisma.asset.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Asset berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}