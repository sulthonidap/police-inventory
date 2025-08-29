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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search ? {
      OR: [
        {
          name: {
            contains: search
          }
        },
        {
          address: {
            contains: search
          }
        },
        {
          phone: {
            contains: search
          }
        }
      ]
    } : {}

    // Get total count for pagination
    const total = await prisma.polda.count({ where })

    // Get poldas with pagination and search
    const poldas = await prisma.polda.findMany({
      where,
      include: {
        _count: {
          select: {
            polres: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      poldas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })
  } catch (error) {
    console.error('Error fetching poldas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch poldas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nama Polda harus diisi' },
        { status: 400 }
      )
    }

    // Check if polda with same name already exists
    const existingPolda = await prisma.polda.findFirst({
      where: {
        name: name
      }
    })

    if (existingPolda) {
      return NextResponse.json(
        { error: 'Polda dengan nama tersebut sudah ada' },
        { status: 400 }
      )
    }

    const polda = await prisma.polda.create({
      data: {
        name,
        address,
        phone
      },
      include: {
        _count: {
          select: {
            polres: true
          }
        }
      }
    })

    return NextResponse.json(polda, { status: 201 })
  } catch (error) {
    console.error('Error creating polda:', error)
    return NextResponse.json(
      { error: 'Failed to create polda' },
      { status: 500 }
    )
  }
}
