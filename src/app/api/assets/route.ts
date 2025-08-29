import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const type = searchParams.get('type') || undefined
    const q = searchParams.get('q') || undefined
    const polresId = searchParams.get('polresId') || undefined
    const poldaId = searchParams.get('poldaId') || undefined

    const skip = (page - 1) * limit

    const where: any = {}
    if (type) where.kind = type as any
    if (polresId) where.polresId = polresId
    if (poldaId) where.poldaId = poldaId
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { categoryLevel1: { contains: q } },
        { categoryLevel3: { contains: q } },
        { inventoryNumber: { contains: q } }
      ]
    }

    // Role-based filtering
    if (session.user.role === 'POLDA' && session.user.poldaId) {
      // POLDA can only see assets from their Polda
      where.poldaId = session.user.poldaId
    } else if (session.user.role === 'POLRES' && session.user.polresId) {
      // POLRES can only see assets from their Polres
      where.polresId = session.user.polresId
    } else if (session.user.role === 'USER' && session.user.polresId) {
      // USER can only see assets from their Polres
      where.polresId = session.user.polresId
    }
    // ADMIN and KORLANTAS can see all assets (no additional filtering)

    // Get total count
    const total = await prisma.asset.count({ where })

    // Get assets with pagination
    const assets = await prisma.asset.findMany({
      where,
      include: {
        polres: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, nrp: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error: any) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    // Fields
    let name: string | null = null
    let category: string | null = null // legacy enum
    let polresId: string | null = null
    let assignedTo: string | null = null

    let kind: string | null = null
    let categoryLevel1: string | null = null
    let categoryLevel2: string | null = null
    let categoryLevel3: string | null = null
    let source: string | null = null
    let inventoryNumber: string | null = null
    let year: string | null = null
    let poldaId: string | null = null
    let qrData: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      name = body.name ?? null
      category = body.category ?? null
      polresId = body.polresId ?? null
      assignedTo = body.assignedTo ?? null

      kind = body.kind ?? null
      categoryLevel1 = body.categoryLevel1 ?? null
      categoryLevel2 = body.categoryLevel2 ?? null
      categoryLevel3 = body.categoryLevel3 ?? null
      source = body.source ?? null
      inventoryNumber = body.inventoryNumber ?? null
      year = body.year ?? null
      poldaId = body.poldaId ?? null
      qrData = body.qrData ?? null
    } else {
      const form = await request.formData()
      name = (form.get("name") as string) || null
      category = (form.get("category") as string) || null
      polresId = (form.get("polresId") as string) || null
      assignedTo = ((form.get("assignedTo") as string) || null) || null

      kind = (form.get("kind") as string) || null
      categoryLevel1 = (form.get("categoryLevel1") as string) || null
      categoryLevel2 = (form.get("categoryLevel2") as string) || null
      categoryLevel3 = (form.get("categoryLevel3") as string) || null
      source = (form.get("source") as string) || null
      inventoryNumber = (form.get("inventoryNumber") as string) || null
      year = (form.get("year") as string) || null
      poldaId = (form.get("poldaId") as string) || null
      qrData = (form.get("qrData") as string) || null
    }

    if (!name || !polresId) {
      return NextResponse.json({ error: "Nama dan Polres harus diisi" }, { status: 400 })
    }

    // Validate category enum
    const validCategories = ['KENDARAAN', 'SENJATA', 'PERALATAN', 'KOMPUTER', 'KOMUNIKASI', 'LAINNYA']
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: `Kategori tidak valid. Pilih salah satu: ${validCategories.join(', ')}` }, { status: 400 })
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        category: (category || 'LAINNYA') as any,
        polresId,
        assignedTo,
        status: "ACTIVE",
        kind: (kind as any) || undefined,
        categoryLevel1: categoryLevel1 || undefined,
        categoryLevel2: categoryLevel2 || undefined,
        categoryLevel3: categoryLevel3 || undefined,
        source: (source as any) || undefined,
        inventoryNumber: inventoryNumber || undefined,
        year: year ? parseInt(year) : undefined,
        poldaId: poldaId || undefined,
        qrData: qrData || undefined
      }
    })

    return NextResponse.json({ 
      success: "Asset berhasil ditambahkan",
      asset: { id: asset.id }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan asset', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}
