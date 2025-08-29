import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const preferredRegion = 'auto'

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Generate CSV content
    const csvContent = generateCSV(report)

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="report-${id}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting report:", error)
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    )
  }
}

function generateCSV(report: any): string {
  const headers = [
    'ID Report',
    'Judul',
    'Deskripsi',
    'Tipe',
    'Status',
    'Tanggal Dibuat',
    'Tanggal Update',
    'Polres ID',
    'Polres Nama',
    'Polda ID',
    'Polda Nama',
    'User ID',
    'User Nama',
    'User NRP',
    'User Email'
  ]

  const values = [
    report.id,
    report.title || '',
    report.description || '',
    report.type || '',
    report.status || '',
    report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID') : '',
    report.updatedAt ? new Date(report.updatedAt).toLocaleDateString('id-ID') : '',
    report.polresId || '',
    report.polres?.name || '',
    report.polres?.polda?.id || '',
    report.polres?.polda?.name || '',
    report.userId || '',
    report.user?.name || '',
    report.user?.nrp || '',
    report.user?.email || ''
  ]

  const csvRows = [headers.join(','), values.map(v => `"${v}"`).join(',')]
  return csvRows.join('\n')
}
