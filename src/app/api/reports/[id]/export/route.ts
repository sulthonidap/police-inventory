import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf'

    // Fetch report data
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

    // For now, we'll return a simple text response
    // In a real implementation, you would use libraries like:
    // - PDF: puppeteer, jsPDF, or similar
    // - Excel: xlsx, exceljs, or similar
    
    let content = ''
    let filename = ''
    let contentType = ''

    if (format === 'pdf') {
      // Generate PDF content (simplified)
      content = `
LAPORAN: ${report.title}
Tipe: ${report.type}
Status: ${report.status}
Deskripsi: ${report.description}
Pembuat: ${report.user.name} (${report.user.nrp})
Polres: ${report.polres?.name || '-'}
Tanggal Dibuat: ${new Date(report.createdAt).toLocaleDateString('id-ID')}
      `.trim()
      
      filename = `laporan-${report.id}.pdf`
      contentType = 'application/pdf'
    } else if (format === 'excel') {
      // Generate Excel content (simplified)
      content = `
Judul,Tipe,Status,Deskripsi,Pembuat,NRP,Polres,Tanggal Dibuat
"${report.title}","${report.type}","${report.status}","${report.description}","${report.user.name}","${report.user.nrp}","${report.polres?.name || '-'}","${new Date(report.createdAt).toLocaleDateString('id-ID')}"
      `.trim()
      
      filename = `laporan-${report.id}.csv`
      contentType = 'text/csv'
    } else {
      return NextResponse.json({ error: "Format tidak didukung" }, { status: 400 })
    }

    // Create response with appropriate headers
    const response = new NextResponse(content)
    response.headers.set('Content-Type', contentType)
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    
    return response
  } catch (error: any) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengexport laporan', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}
