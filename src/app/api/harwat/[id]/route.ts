import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const harwat = await prisma.harwat.findUnique({
      where: {
        id: id
      }
    })

    if (!harwat) {
      return NextResponse.json(
        { error: "Data Harwat tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(harwat)
  } catch (error) {
    console.error('Error fetching harwat:', error)
    return NextResponse.json(
      { error: "Gagal mengambil data Harwat" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const title = formData.get('title') as string
    const dateTime = formData.get('dateTime') as string
    const description = formData.get('description') as string
    const photos = formData.getAll('photos') as File[]
    const keepExistingPhotos = formData.get('keepExistingPhotos') === 'true'

    if (!title || !dateTime || !description) {
      return NextResponse.json(
        { error: "Judul, tanggal/waktu, dan keterangan harus diisi" },
        { status: 400 }
      )
    }

    // Check if harwat exists
    const existingHarwat = await prisma.harwat.findUnique({
      where: { id: id }
    })

    if (!existingHarwat) {
      return NextResponse.json(
        { error: "Data Harwat tidak ditemukan" },
        { status: 404 }
      )
    }

    let photoPaths: string[] = []

    // Keep existing photos if requested
    if (keepExistingPhotos && existingHarwat.photos) {
      try {
        photoPaths = JSON.parse(existingHarwat.photos)
      } catch (error) {
        console.error('Error parsing existing photos:', error)
      }
    }

    // Handle new photo uploads
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

    // Delete old photos if not keeping existing ones
    if (!keepExistingPhotos && existingHarwat.photos) {
      try {
        const oldPhotos = JSON.parse(existingHarwat.photos)
        for (const oldPhoto of oldPhotos) {
          const oldPhotoPath = join(process.cwd(), 'public', oldPhoto)
          if (existsSync(oldPhotoPath)) {
            await unlink(oldPhotoPath)
          }
        }
      } catch (error) {
        console.error('Error deleting old photos:', error)
      }
    }

    const harwat = await prisma.harwat.update({
      where: { id: id },
      data: {
        title,
        dateTime: new Date(dateTime),
        description,
        photos: photoPaths.length > 0 ? JSON.stringify(photoPaths) : null
      }
    })

    return NextResponse.json(harwat)
  } catch (error) {
    console.error('Error updating harwat:', error)
    return NextResponse.json(
      { error: "Gagal memperbarui data Harwat" },
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
    // Check if harwat exists
    const existingHarwat = await prisma.harwat.findUnique({
      where: { id: id }
    })

    if (!existingHarwat) {
      return NextResponse.json(
        { error: "Data Harwat tidak ditemukan" },
        { status: 404 }
      )
    }

    // Delete photo files if exist
    if (existingHarwat.photos) {
      try {
        const photos = JSON.parse(existingHarwat.photos)
        for (const photo of photos) {
          const photoPath = join(process.cwd(), 'public', photo)
          if (existsSync(photoPath)) {
            await unlink(photoPath)
          }
        }
      } catch (error) {
        console.error('Error deleting photos:', error)
      }
    }

    await prisma.harwat.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Data Harwat berhasil dihapus" })
  } catch (error) {
    console.error('Error deleting harwat:', error)
    return NextResponse.json(
      { error: "Gagal menghapus data Harwat" },
      { status: 500 }
    )
  }
}
