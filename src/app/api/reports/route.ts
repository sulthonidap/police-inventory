import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Konfigurasi untuk Vercel deployment

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const polresId = searchParams.get('polresId') || ''
    const poldaId = searchParams.get('poldaId') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (type && type !== 'all') {
      where.type = type
    }
    
    if (polresId) {
      where.polresId = polresId
    }
    
    if (poldaId) {
      where.poldaId = poldaId
    }

    // Role-based filtering
    if (session.user.role === 'POLDA' && session.user.poldaId) {
      // POLDA can only see reports from their Polda
      where.poldaId = session.user.poldaId
    } else if (session.user.role === 'POLRES' && session.user.polresId) {
      // POLRES can only see reports from their Polres
      where.polresId = session.user.polresId
    } else if (session.user.role === 'USER' && session.user.polresId) {
      // USER can only see reports from their Polres
      where.polresId = session.user.polresId
    }
    // ADMIN and KORLANTAS can see all reports (no additional filtering)

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              nrp: true
            }
          },
          polda: {
            select: {
              id: true,
              name: true
            }
          },
          polres: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.report.count({ where })
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = request.headers.get("content-type") || ""

    // New report fields
    let reportType: string | null = null
    let problemType: string | null = null
    let description: string | null = null
    let assetId: string | null = null
    let assetName: string | null = null
    let assetInventoryNumber: string | null = null

    // Legacy fields for backward compatibility
    let title: string | null = null
    let type: string | null = null
    let customType: string | null = null
    let poldaId: string | null = null
    let polresId: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      reportType = body.reportType ?? null
      problemType = body.problemType ?? null
      description = body.description ?? null
      assetId = body.assetId ?? null
      assetName = body.assetName ?? null
      assetInventoryNumber = body.assetInventoryNumber ?? null
      
      // Legacy fields
      title = body.title ?? null
      type = body.type ?? null
      customType = body.customType ?? null
      poldaId = body.poldaId ?? null
      polresId = body.polresId ?? null
    } else {
      const form = await request.formData()
      reportType = (form.get("reportType") as string) || null
      problemType = (form.get("problemType") as string) || null
      description = (form.get("description") as string) || null
      assetId = (form.get("assetId") as string) || null
      assetName = (form.get("assetName") as string) || null
      assetInventoryNumber = (form.get("assetInventoryNumber") as string) || null
      
      // Legacy fields
      title = (form.get("title") as string) || null
      type = (form.get("type") as string) || null
      customType = (form.get("customType") as string) || null
      poldaId = (form.get("poldaId") as string) || null
      polresId = (form.get("polresId") as string) || null
    }

    // Validation
    if (!reportType || !problemType || !description) {
      return NextResponse.json({ error: "Jenis laporan, jenis permasalahan, dan deskripsi harus diisi" }, { status: 400 })
    }

    // Generate title if not provided
    if (!title) {
      const reportTypeNames = {
        "ASSET_OPERATIONAL": "Tiket Kendala Operasional Aset",
        "APPLICATION_HELP": "Tiket Bantuan Aplikasi Aset",
        "GENERAL_ISSUE": "Tiket Bantuan Permasalahan Umum",
        "OTHER": "Tiket Bantuan Lainnya"
      }
      title = `${reportTypeNames[reportType as keyof typeof reportTypeNames] || "Laporan"} - ${problemType}`
    }

    // Get user's region information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        polresId: true, 
        poldaId: true,
        polres: { select: { poldaId: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    // Set region based on user's location
    const finalPolresId = polresId || user.polresId
    const finalPoldaId = poldaId || user.poldaId || user.polres?.poldaId

    // Create report content with structured data
    const reportContent = {
      reportType,
      problemType,
      description,
      asset: assetId ? {
        id: assetId,
        name: assetName,
        inventoryNumber: assetInventoryNumber
      } : null,
      attachments: [], // Will be handled separately for file uploads
      createdAt: new Date().toISOString()
    }

    const report = await prisma.report.create({
      data: {
        title,
        type: "CUSTOM" as any, // Use CUSTOM type for new reports
        customType: reportType,
        description,
        content: JSON.stringify(reportContent),
        status: "SUBMITTED", // New reports start as SUBMITTED
        userId: user.id,
        poldaId: finalPoldaId || undefined,
        polresId: finalPolresId || undefined
      },
      include: {
        user: {
          select: {
            name: true,
            nrp: true
          }
        },
        polda: {
          select: {
            id: true,
            name: true
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

    // TODO: Handle file uploads if needed
    // For now, we'll just return success

    return NextResponse.json({
      success: "Laporan berhasil dibuat",
      report
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat laporan', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}
