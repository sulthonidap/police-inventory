import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const customTypes = await prisma.customReportType.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(customTypes)
  } catch (error) {
    console.error('Error fetching custom report types:', error)
    return NextResponse.json(
      { error: "Gagal memuat tipe laporan kustom", detail: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Nama tipe laporan harus diisi" }, { status: 400 })
    }

    // Check if name already exists
    const existingType = await prisma.customReportType.findUnique({
      where: { name }
    })

    if (existingType) {
      return NextResponse.json({ error: "Tipe laporan dengan nama ini sudah ada" }, { status: 400 })
    }

    const customType = await prisma.customReportType.create({
      data: {
        name,
        description: description || null
      }
    })

    return NextResponse.json({
      success: "Tipe laporan kustom berhasil dibuat",
      customType
    })
  } catch (error) {
    console.error('Error creating custom report type:', error)
    return NextResponse.json(
      { error: "Gagal membuat tipe laporan kustom", detail: String(error) },
      { status: 500 }
    )
  }
}
