import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export const preferredRegion = 'auto'

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    const contentType = request.headers.get("content-type") || ""

    let title: string | null = null
    let type: string | null = null
    let customType: string | null = null
    let description: string | null = null
    let poldaId: string | null = null
    let polresId: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      title = body.title ?? null
      type = body.type ?? null
      customType = body.customType ?? null
      description = body.description ?? null
      poldaId = body.poldaId ?? null
      polresId = body.polresId ?? null
    } else {
      const form = await request.formData()
      title = (form.get("title") as string) || null
      type = (form.get("type") as string) || null
      customType = (form.get("customType") as string) || null
      description = (form.get("description") as string) || null
      poldaId = (form.get("poldaId") as string) || null
      polresId = (form.get("polresId") as string) || null
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

    const report = await prisma.report.create({
      data: {
        title,
        type: type as any,
        customType: type === "CUSTOM" ? customType : null,
        description,
        content: description, // Use description as content for now
        status: "DRAFT",
        userId,
        poldaId: poldaId || undefined,
        polresId: polresId || undefined
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
