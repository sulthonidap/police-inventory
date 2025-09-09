import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET() {
  try {
    const harwat = await prisma.harwat.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(harwat)
  } catch (error) {
    console.error('Error fetching harwat:', error)
    return NextResponse.json(
      { error: "Gagal mengambil data Harwat" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const title = formData.get('title') as string
    const dateTime = formData.get('dateTime') as string
    const description = formData.get('description') as string
    const photos = formData.getAll('photos') as File[]

    if (!title || !dateTime || !description) {
      return NextResponse.json(
        { error: "Judul, tanggal/waktu, dan keterangan harus diisi" },
        { status: 400 }
      )
    }

    const photoPaths: string[] = []

    // Handle multiple photo uploads
    for (const photo of photos) {
      if (photo && photo.size > 0) {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'harwat')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const filename = `${timestamp}-${randomSuffix}-${photo.name}`
        const filepath = join(uploadsDir, filename)
        
        await writeFile(filepath, buffer)
        photoPaths.push(`/uploads/harwat/${filename}`)
      }
    }

    const harwat = await prisma.harwat.create({
      data: {
        title,
        dateTime: new Date(dateTime),
        description,
        photos: photoPaths.length > 0 ? JSON.stringify(photoPaths) : null
      }
    })

    return NextResponse.json(harwat, { status: 201 })
  } catch (error) {
    console.error('Error creating harwat:', error)
    return NextResponse.json(
      { error: "Gagal membuat data Harwat" },
      { status: 500 }
    )
  }
}
