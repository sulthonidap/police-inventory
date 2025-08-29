import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nrp: true,
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
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
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
    const { 
      title, 
      description, 
      type, 
      status, 
      polresId
    } = body
    const { id } = await context.params

    if (!title) {
      return NextResponse.json(
        { error: 'Judul report harus diisi' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Tipe report harus dipilih' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status report harus dipilih' },
        { status: 400 }
      )
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id }
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if polres exists (if provided)
    if (polresId) {
      const polres = await prisma.polres.findUnique({
        where: { id: polresId }
      })

      if (!polres) {
        return NextResponse.json(
          { error: 'Polres tidak ditemukan' },
          { status: 404 }
        )
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        title,
        description,
        type,
        status,
        polresId: polresId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nrp: true,
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
      }
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Failed to update report' },
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
    
    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id }
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.report.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Report berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    )
  }
}
