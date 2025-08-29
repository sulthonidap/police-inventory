import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        polres: { 
          select: { 
            id: true, 
            name: true
          } 
        },
        user: { 
          select: { 
            id: true, 
            name: true, 
            nrp: true 
          } 
        }
      }
    })

    if (!asset) {
      return NextResponse.json(
        { error: "Asset tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(asset)
  } catch (error: any) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data asset', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contentType = request.headers.get("content-type") || ""

    // Fields
    let name: string | null = null
    let category: string | null = null
    let status: string | null = null
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
      status = body.status ?? null
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
      status = (form.get("status") as string) || null
      polresId = (form.get("polresId") as string) || null
      assignedTo = (form.get("assignedTo") as string) || null
      kind = (form.get("kind") as string) || null
      categoryLevel1 = (form.get("categoryLevel1") as string) || null
      categoryLevel2 = (form.get("categoryLevel2") as string) || null
      categoryLevel3 = (form.get("categoryLevel3") as string) || null
      source = (form.get("source") as string) || null
      inventoryNumber = (form.get("inventoryNumber") as string) || null
      poldaId = (form.get("poldaId") as string) || null
      qrData = (form.get("qrData") as string) || null
    }

    const { id } = await params
    
    if (!name || !polresId) {
      return NextResponse.json(
        { error: "Nama dan Polres harus diisi" },
        { status: 400 }
      )
    }

    const asset = await prisma.asset.update({
      where: { id },
             data: {
         name,
         category: (category as any) || undefined,
         status: (status as any) || undefined,
         polresId,
         assignedTo,
                 source: (source as any) || undefined,
        inventoryNumber: inventoryNumber || undefined,
        year: year ? parseInt(year) : undefined,
        poldaId: poldaId || undefined,
        qrData: qrData || undefined
       }
    })

    return NextResponse.json({ 
      success: "Asset berhasil diperbarui",
      asset
    })
  } catch (error: any) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui asset', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.asset.delete({
      where: { id }
    })

    return NextResponse.json({ success: "Asset berhasil dihapus" })
  } catch (error: any) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus asset', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}