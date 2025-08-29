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

    const skip = (page - 1) * limit

    // Build where clause for search
    let where: any = search ? {
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
        },
        {
          polda: {
            name: {
              contains: search
            }
          }
        }
      ]
    } : {}

    // Role-based filtering
    console.log('🔍 User role:', session.user.role)
    console.log('🔍 User poldaId:', session.user.poldaId)
    console.log('🔍 User polresId:', session.user.polresId)
    
    if (session.user.role === 'POLDA' && session.user.poldaId) {
      // POLDA can only see Polres from their Polda
      where = { ...where, poldaId: session.user.poldaId }
      console.log('🔍 POLDA filtering: poldaId =', session.user.poldaId)
    } else if (session.user.role === 'POLRES' && session.user.polresId) {
      // POLRES can only see their own Polres
      where = { ...where, id: session.user.polresId }
      console.log('🔍 POLRES filtering: id =', session.user.polresId)
    } else if (session.user.role === 'USER' && session.user.polresId) {
      // USER can only see their Polres
      where = { ...where, id: session.user.polresId }
      console.log('🔍 USER filtering: id =', session.user.polresId)
    } else {
      console.log('🔍 No filtering applied (ADMIN/KORLANTAS or no poldaId/polresId)')
    }
    // ADMIN and KORLANTAS can see all Polres (no additional filtering)

    // Get total count for pagination
    const total = await prisma.polres.count({ where })

    // Get polres with pagination and search
    const polres = await prisma.polres.findMany({
      where,
      include: {
        polda: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            users: true,
            assets: true
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
      polres,
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
    console.error('Error fetching polres:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polres' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone, poldaId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nama Polres harus diisi' },
        { status: 400 }
      )
    }

    if (!poldaId) {
      return NextResponse.json(
        { error: 'Polda harus dipilih' },
        { status: 400 }
      )
    }

    // Check if polda exists
    const polda = await prisma.polda.findUnique({
      where: { id: poldaId }
    })

    if (!polda) {
      return NextResponse.json(
        { error: 'Polda tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check if polres with same name already exists
    const existingPolres = await prisma.polres.findFirst({
      where: {
        name: name,
        poldaId: poldaId
      }
    })

    if (existingPolres) {
      return NextResponse.json(
        { error: 'Polres dengan nama tersebut sudah ada di Polda ini' },
        { status: 400 }
      )
    }

    const polres = await prisma.polres.create({
      data: {
        name,
        address,
        phone,
        poldaId
      },
      include: {
        polda: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            users: true,
            assets: true
          }
        }
      }
    })

    return NextResponse.json(polres, { status: 201 })
  } catch (error) {
    console.error('Error creating polres:', error)
    return NextResponse.json(
      { error: 'Failed to create polres' },
      { status: 500 }
    )
  }
}
