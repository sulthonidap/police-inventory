import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            nrp: true
          }
        },
        polres: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params
    const contentType = request.headers.get("content-type") || ""

    let title: string | null = null
    let type: string | null = null
    let description: string | null = null
    let polresId: string | null = null
    let status: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      title = body.title ?? null
      type = body.type ?? null
      description = body.description ?? null
      polresId = body.polresId ?? null
      status = body.status ?? null
    } else {
      const form = await request.formData()
      title = (form.get("title") as string) || null
      type = (form.get("type") as string) || null
      description = (form.get("description") as string) || null
      polresId = (form.get("polresId") as string) || null
      status = (form.get("status") as string) || null
    }

    if (!title || !type || !description) {
      return NextResponse.json({ error: "Judul, tipe, dan deskripsi harus diisi" }, { status: 400 })
    }

    // Get current user from session (you'll need to implement this based on your auth system)
    // For now, we'll use the first available user or get from request
    const firstUser = await prisma.user.findFirst({
      select: { id: true }
    })
    
    if (!firstUser) {
      return NextResponse.json({ error: "Tidak ada user yang tersedia" }, { status: 400 })
    }
    
    const userId = firstUser.id

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        title,
        type: type as any,
        description,
        content: description, // Use description as content for now
        status: status ? (status as any) : undefined,
        polresId: polresId || undefined
      },
      include: {
        user: {
          select: {
            name: true,
            nrp: true
          }
        },
        polres: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ success: "Laporan berhasil diperbarui", report: updatedReport })
  } catch (error: any) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui laporan', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params
    
    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id }
    })

    if (!existingReport) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 })
    }

    await prisma.report.delete({ where: { id } })
    return NextResponse.json({ success: "Laporan berhasil dihapus" })
  } catch (error: any) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus laporan', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}
