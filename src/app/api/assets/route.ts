import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const kind = searchParams.get('kind') || undefined
    const q = searchParams.get('q') || undefined
    const polresId = searchParams.get('polresId') || undefined
    const poldaId = searchParams.get('poldaId') || undefined

    const skip = (page - 1) * limit

    const where: any = {}
    if (kind) where.kind = kind as any
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
        categoryRef: { select: { id: true, name: true } },
        polres: { 
          select: { 
            id: true, 
            name: true,
            polda: { select: { id: true, name: true } }
          } 
        },
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
    
    // Handle specific Prisma errors
    if (error?.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Database constraint violation' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    // Fields
    let name: string | null = null
    let categoryId: string | null = null
    let polresId: string | null = null
    let userId: string | null = null

    // Section 1: Identitas Aset
    let kind: string | null = null
    let categoryLevel1: string | null = null
    let inventoryNumber: string | null = null
    let registrationDate: string | null = null

    // Section 2: Identitas Aset (Wilayah)
    let sourceRegionId: string | null = null
    let operationalRegionId: string | null = null

    // Section 3: Data Sumber dan Status Aset
    let source: string | null = null
    let sourceDetail: string | null = null
    let sourceCompanyName: string | null = null
    let sourceCompanyAddress: string | null = null
    let sourceCompanyProvince: string | null = null
    let sourceCompanyRegency: string | null = null
    let sourceCompanyDistrict: string | null = null
    let sourceCompanyVillage: string | null = null
    let sourceCompanyRepName: string | null = null
    let sourceCompanyRepEmail: string | null = null
    let sourceCompanyRepPhone: string | null = null
    
    // Untuk Pinjam Pakai
    let loanRegionId: string | null = null
    let usageRegionId: string | null = null
    let loanRepName: string | null = null
    let loanRepEmail: string | null = null
    let loanRepPhone: string | null = null
    let loanDocumentFile: string | null = null

    // Section 4: Status Pemeliharaan dan Perawatan
    let maintenanceStatus: string | null = null
    let simakData: string[] | null = null
    let maintenanceCompanyName: string | null = null
    let maintenanceCompanyAddress: string | null = null
    let maintenanceCompanyProvince: string | null = null
    let maintenanceCompanyRegency: string | null = null
    let maintenanceCompanyDistrict: string | null = null
    let maintenanceCompanyVillage: string | null = null
    let maintenanceRepName: string | null = null
    let maintenanceRepEmail: string | null = null
    let maintenanceRepPhone: string | null = null
    let maintenanceValidityDate: string | null = null
    
    // Untuk Non-Aktif
    let inactiveSimakData: string[] | null = null
    let inactiveSimakInstitution: string | null = null
    let inactiveReason: string | null = null

    // Legacy fields
    let categoryLevel2: string | null = null
    let categoryLevel3: string | null = null
    let year: string | null = null
    let poldaId: string | null = null
    let qrData: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      name = body.name ?? null
      categoryId = body.categoryId ?? null
      polresId = body.polresId ?? null
      userId = body.userId ?? null

      // Section 1: Identitas Aset
      kind = body.kind ?? null
      categoryLevel1 = body.categoryLevel1 ?? null
      inventoryNumber = body.inventoryNumber ?? null
      registrationDate = body.registrationDate ?? null

      // Section 2: Identitas Aset (Wilayah)
      sourceRegionId = body.sourceRegionId ?? null
      operationalRegionId = body.operationalRegionId ?? null

      // Section 3: Data Sumber dan Status Aset
      source = body.source ?? null
      sourceDetail = body.sourceDetail ?? null
      sourceCompanyName = body.sourceCompanyName ?? null
      sourceCompanyAddress = body.sourceCompanyAddress ?? null
      sourceCompanyProvince = body.sourceCompanyProvince ?? null
      sourceCompanyRegency = body.sourceCompanyRegency ?? null
      sourceCompanyDistrict = body.sourceCompanyDistrict ?? null
      sourceCompanyVillage = body.sourceCompanyVillage ?? null
      sourceCompanyRepName = body.sourceCompanyRepName ?? null
      sourceCompanyRepEmail = body.sourceCompanyRepEmail ?? null
      sourceCompanyRepPhone = body.sourceCompanyRepPhone ?? null
      
      // Untuk Pinjam Pakai
      loanRegionId = body.loanRegionId ?? null
      usageRegionId = body.usageRegionId ?? null
      loanRepName = body.loanRepName ?? null
      loanRepEmail = body.loanRepEmail ?? null
      loanRepPhone = body.loanRepPhone ?? null
      loanDocumentFile = body.loanDocumentFile ?? null

      // Section 4: Status Pemeliharaan dan Perawatan
      maintenanceStatus = body.maintenanceStatus ?? null
      simakData = body.simakData ?? null
      maintenanceCompanyName = body.maintenanceCompanyName ?? null
      maintenanceCompanyAddress = body.maintenanceCompanyAddress ?? null
      maintenanceCompanyProvince = body.maintenanceCompanyProvince ?? null
      maintenanceCompanyRegency = body.maintenanceCompanyRegency ?? null
      maintenanceCompanyDistrict = body.maintenanceCompanyDistrict ?? null
      maintenanceCompanyVillage = body.maintenanceCompanyVillage ?? null
      maintenanceRepName = body.maintenanceRepName ?? null
      maintenanceRepEmail = body.maintenanceRepEmail ?? null
      maintenanceRepPhone = body.maintenanceRepPhone ?? null
      maintenanceValidityDate = body.maintenanceValidityDate ?? null
      
      // Untuk Non-Aktif
      inactiveSimakData = body.inactiveSimakData ?? null
      inactiveSimakInstitution = body.inactiveSimakInstitution ?? null
      inactiveReason = body.inactiveReason ?? null

      // Legacy fields
      categoryLevel2 = body.categoryLevel2 ?? null
      categoryLevel3 = body.categoryLevel3 ?? null
      year = body.year ?? null
      poldaId = body.poldaId ?? null
      qrData = body.qrData ?? null
    } else {
      const form = await request.formData()
      name = (form.get("name") as string) || null
      categoryId = (form.get("categoryId") as string) || null
      polresId = (form.get("polresId") as string) || null
      userId = (form.get("userId") as string) || null

      // Section 1: Identitas Aset
      kind = (form.get("kind") as string) || null
      categoryLevel1 = (form.get("categoryLevel1") as string) || null
      inventoryNumber = (form.get("inventoryNumber") as string) || null
      registrationDate = (form.get("registrationDate") as string) || null

      // Section 2: Identitas Aset (Wilayah)
      sourceRegionId = (form.get("sourceRegionId") as string) || null
      operationalRegionId = (form.get("operationalRegionId") as string) || null

      // Section 3: Data Sumber dan Status Aset
      source = (form.get("source") as string) || null
      sourceDetail = (form.get("sourceDetail") as string) || null
      sourceCompanyName = (form.get("sourceCompanyName") as string) || null
      sourceCompanyAddress = (form.get("sourceCompanyAddress") as string) || null
      sourceCompanyProvince = (form.get("sourceCompanyProvince") as string) || null
      sourceCompanyRegency = (form.get("sourceCompanyRegency") as string) || null
      sourceCompanyDistrict = (form.get("sourceCompanyDistrict") as string) || null
      sourceCompanyVillage = (form.get("sourceCompanyVillage") as string) || null
      sourceCompanyRepName = (form.get("sourceCompanyRepName") as string) || null
      sourceCompanyRepEmail = (form.get("sourceCompanyRepEmail") as string) || null
      sourceCompanyRepPhone = (form.get("sourceCompanyRepPhone") as string) || null
      
      // Untuk Pinjam Pakai
      loanRegionId = (form.get("loanRegionId") as string) || null
      usageRegionId = (form.get("usageRegionId") as string) || null
      loanRepName = (form.get("loanRepName") as string) || null
      loanRepEmail = (form.get("loanRepEmail") as string) || null
      loanRepPhone = (form.get("loanRepPhone") as string) || null
      loanDocumentFile = (form.get("loanDocumentFile") as string) || null

      // Section 4: Status Pemeliharaan dan Perawatan
      maintenanceStatus = (form.get("maintenanceStatus") as string) || null
      simakData = form.get("simakData") ? JSON.parse(form.get("simakData") as string) : null
      maintenanceCompanyName = (form.get("maintenanceCompanyName") as string) || null
      maintenanceCompanyAddress = (form.get("maintenanceCompanyAddress") as string) || null
      maintenanceCompanyProvince = (form.get("maintenanceCompanyProvince") as string) || null
      maintenanceCompanyRegency = (form.get("maintenanceCompanyRegency") as string) || null
      maintenanceCompanyDistrict = (form.get("maintenanceCompanyDistrict") as string) || null
      maintenanceCompanyVillage = (form.get("maintenanceCompanyVillage") as string) || null
      maintenanceRepName = (form.get("maintenanceRepName") as string) || null
      maintenanceRepEmail = (form.get("maintenanceRepEmail") as string) || null
      maintenanceRepPhone = (form.get("maintenanceRepPhone") as string) || null
      maintenanceValidityDate = (form.get("maintenanceValidityDate") as string) || null
      
      // Untuk Non-Aktif
      inactiveSimakData = form.get("inactiveSimakData") ? JSON.parse(form.get("inactiveSimakData") as string) : null
      inactiveSimakInstitution = (form.get("inactiveSimakInstitution") as string) || null
      inactiveReason = (form.get("inactiveReason") as string) || null

      // Legacy fields
      categoryLevel2 = (form.get("categoryLevel2") as string) || null
      categoryLevel3 = (form.get("categoryLevel3") as string) || null
      year = (form.get("year") as string) || null
      poldaId = (form.get("poldaId") as string) || null
      qrData = (form.get("qrData") as string) || null
    }

    if (!name || !polresId) {
      return NextResponse.json({ error: "Nama dan Polres harus diisi" }, { status: 400 })
    }

    // Check if polres exists
    const polres = await prisma.polres.findUnique({
      where: { id: polresId }
    })
    if (!polres) {
      return NextResponse.json({ error: "Polres tidak ditemukan" }, { status: 404 })
    }

    // Check if category exists (if provided)
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })
      if (!category) {
        return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 })
      }
    }

    // Check if user exists (if assigned)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      if (!user) {
        return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
      }
    }

    // Check if inventory number is unique (if provided)
    if (inventoryNumber) {
      const duplicateAsset = await prisma.asset.findFirst({
        where: { inventoryNumber }
      })
      if (duplicateAsset) {
        return NextResponse.json({ error: "Inventory number sudah digunakan" }, { status: 400 })
      }
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        category: "LAINNYA" as any, // Default category enum
        categoryId,
        polresId,
        assignedTo: userId,
        status: "ACTIVE",
        
        // Basic fields only (matching current database schema)
        kind: kind === "DIGITAL_IT" ? "DIGITAL" : (kind as any) || undefined,
        categoryLevel1: categoryLevel1 || undefined,
        categoryLevel2: categoryLevel2 || undefined,
        categoryLevel3: categoryLevel3 || undefined,
        inventoryNumber: inventoryNumber || undefined,
        source: source === "PENGADAAN" ? "APBN" : (source as any) || undefined,
        year: year ? parseInt(year) : undefined,
        poldaId: poldaId || undefined,
        qrData: qrData || undefined
      },
      include: {
        categoryRef: { select: { id: true, name: true } },
        polres: { 
          select: { 
            id: true, 
            name: true,
            polda: { select: { id: true, name: true } }
          } 
        },
        user: { select: { id: true, name: true, nrp: true } }
      }
    })

    return NextResponse.json({ 
      success: "Asset berhasil ditambahkan",
      asset
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating asset:', error)
    
    // Handle specific Prisma errors
    if (error?.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Database constraint violation' },
        { status: 400 }
      )
    }
    
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Foreign key constraint failed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}
