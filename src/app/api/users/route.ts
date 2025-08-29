import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check authorization - ADMIN, KORLANTAS, POLDA can access users
    if (!["ADMIN", "KORLANTAS", "POLDA"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const role = searchParams.get('role') || ''
    const polresId = searchParams.get('polresId') || ''
    const poldaId = searchParams.get('poldaId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nrp: { contains: search, mode: 'insensitive' } },
        {
          polres: {
            polda: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        },
        {
          polres: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (role) {
      where.role = role
    }
    
    if (polresId) {
      where.polresId = polresId
    }
    
    if (poldaId) {
      where.poldaId = poldaId
    }

    // Role-based filtering
    if (session.user.role === 'POLDA' && session.user.poldaId) {
      // POLDA can only see users from their Polda
      where.poldaId = session.user.poldaId
    }
    // ADMIN and KORLANTAS can see all users (no additional filtering)

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      include: {
        polres: {
          select: {
            name: true,
            polda: {
              select: {
                name: true
              }
            }
          }
        },
        polda: {
          select: {
            name: true
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

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { nrp, name, email, password, role, polresId, poldaId } = body as {
      nrp: string; name: string; email: string; password: string; role: "ADMIN" | "KORLANTAS" | "POLDA" | "POLRES" | "USER"; polresId?: string | null; poldaId?: string | null
    }

    // Validate required fields
    if (!nrp || !name || !email || !password || !role) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    // Normalize empty strings to null
    polresId = polresId || null
    poldaId = poldaId || null

    // Preload referenced entities and validate relations
    let polres = null as null | { id: string; poldaId: string }
    let polda = null as null | { id: string }

    if (polresId) {
      polres = await prisma.polres.findUnique({ where: { id: polresId }, select: { id: true, poldaId: true } })
      if (!polres) {
        return NextResponse.json({ error: 'Polres tidak ditemukan' }, { status: 400 })
      }
    }

    if (poldaId) {
      polda = await prisma.polda.findUnique({ where: { id: poldaId }, select: { id: true } })
      if (!polda) {
        return NextResponse.json({ error: 'Polda tidak ditemukan' }, { status: 400 })
      }
    }

    // Role-based validation and derivation
    if (role === 'USER') {
      if (!polres || !polda) {
        return NextResponse.json({ error: 'Untuk role USER, pilih Polda dan Polres' }, { status: 400 })
      }
      if (polres.poldaId !== polda.id) {
        return NextResponse.json({ error: 'Polres yang dipilih tidak termasuk dalam Polda tersebut' }, { status: 400 })
      }
    } else if (role === 'POLRES') {
      if (!polres) {
        return NextResponse.json({ error: 'Untuk role POLRES, pilih Polres' }, { status: 400 })
      }
      // derive poldaId from polres
      poldaId = polres.poldaId
    } else if (role === 'POLDA') {
      if (!polda) {
        return NextResponse.json({ error: 'Untuk role POLDA, pilih Polda' }, { status: 400 })
      }
      // ensure no polresId bound
      polresId = null
    } else {
      // Other roles (ADMIN/KORLANTAS) must not require relations
      polresId = polresId || null
      poldaId = poldaId || null
    }

    // Check unique constraints (email and nrp)
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { nrp }] },
      select: { id: true, email: true, nrp: true }
    })
    if (exists) {
      return NextResponse.json({ error: 'Email atau NRP sudah terdaftar' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        nrp,
        name,
        email,
        password: hashedPassword,
        role,
        status: 'PENDING',
        ...(polresId ? { polres: { connect: { id: polresId } } } : {}),
        ...(poldaId ? { polda: { connect: { id: poldaId } } } : {})
      },
      include: {
        polres: { select: { name: true, polda: { select: { name: true } } } },
        polda: { select: { name: true } }
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email atau NRP sudah terdaftar' }, { status: 400 })
    }
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: 'Relasi Polda/Polres tidak valid' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create user', detail: String(error?.message || error) }, { status: 500 })
  }
}
