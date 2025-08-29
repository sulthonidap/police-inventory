import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kind = searchParams.get('kind')
    const q = searchParams.get('q')

    const where: any = { isActive: true }
    if (kind) where.kind = kind
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } }
      ]
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let name: string | null = null
    let description: string | null = null
    let kind: string | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      name = body.name ?? null
      description = body.description ?? null
      kind = body.kind ?? null
    } else {
      const form = await request.formData()
      name = (form.get("name") as string) || null
      description = (form.get("description") as string) || null
      kind = (form.get("kind") as string) || null
    }

    if (!name || !kind) {
      return NextResponse.json({ error: "Nama dan jenis kategori harus diisi" }, { status: 400 })
    }

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Nama kategori sudah ada" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || undefined,
        kind: kind as any
      }
    })

    return NextResponse.json({ 
      success: "Kategori berhasil ditambahkan",
      category
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menambahkan kategori', detail: String(error?.message || error) },
      { status: 500 }
    )
  }
}
