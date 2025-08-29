import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
export const preferredRegion = 'auto'

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, nrp, password, role, poldaId, polresId, reason } = body

    // Validation
    if (!name || !email || !nrp || !password || !role) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Check if NRP already exists
    const existingNrp = await prisma.user.findUnique({
      where: { nrp }
    })

    if (existingNrp) {
      return NextResponse.json(
        { error: "NRP sudah terdaftar" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with PENDING status
    const user = await prisma.user.create({
      data: {
        name,
        email,
        nrp,
        password: hashedPassword,
        role: role as any,
        status: "PENDING",
        poldaId: poldaId || null,
        polresId: polresId || null,
        // Store registration reason in a note or separate field
        // For now, we'll add it to the name temporarily
        // You might want to add a 'registrationReason' field to the User model
      },
      include: {
        polda: {
          select: {
            name: true
          }
        },
        polres: {
          select: {
            name: true,
            polda: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Log registration for admin review
    console.log(`New user registration: ${name} (${email}) - Role: ${role} - Reason: ${reason}`)

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Akun Anda sedang menunggu persetujuan admin.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar", detail: error.message },
      { status: 500 }
    )
  }
}
