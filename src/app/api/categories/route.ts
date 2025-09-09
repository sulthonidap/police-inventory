import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: "Gagal mengambil data kategori" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, kind, description } = body

    if (!name || !kind) {
      return NextResponse.json(
        { error: "Nama dan jenis kategori harus diisi" },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name,
        kind: kind
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategori dengan nama dan jenis yang sama sudah ada" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        kind,
        description: description || null
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: "Gagal membuat kategori baru" },
      { status: 500 }
    )
  }
}