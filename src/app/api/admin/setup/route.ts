import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin setup request received')
    
    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      nrp,
      secretKey 
    } = body

    console.log('📝 Request data:', { name, email, nrp, secretKey: secretKey ? '***' : 'MISSING' })

    // Validasi field wajib
    if (!name || !email || !password || !nrp || !secretKey) {
      console.log('❌ Missing required fields')
      return NextResponse.json({ 
        error: 'Semua field wajib diisi: name, email, password, nrp, secretKey' 
      }, { status: 400 })
    }

    // Validasi secret key untuk keamanan
    const validSecretKey = process.env.ADMIN_SETUP_SECRET || 'admin-setup-2024'
    if (secretKey !== validSecretKey) {
      console.log('❌ Invalid secret key')
      return NextResponse.json({ 
        error: 'Secret key tidak valid' 
      }, { status: 401 })
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format')
      return NextResponse.json({ 
        error: 'Format email tidak valid' 
      }, { status: 400 })
    }

    // Validasi password minimal 8 karakter
    if (password.length < 8) {
      console.log('❌ Password too short')
      return NextResponse.json({ 
        error: 'Password minimal 8 karakter' 
      }, { status: 400 })
    }

    console.log('✅ Validation passed, checking database...')

    // Test database connection
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 503 })
    }

    // Check jika user sudah ada
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email },
          { nrp }
        ]
      }
    })

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email)
      return NextResponse.json({ 
        error: 'Email atau NRP sudah terdaftar' 
      }, { status: 400 })
    }

    console.log('✅ User validation passed, creating admin...')

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Buat user admin
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        nrp,
        role: 'ADMIN',
        status: 'APPROVED', // Langsung approved
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Admin user created successfully:', adminUser.id)

    // Hapus password dari response
    const { password: _, ...userWithoutPassword } = adminUser

    return NextResponse.json({
      success: true,
      message: 'Admin user berhasil dibuat dan langsung di-approve',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Error creating admin user:', error)
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Email atau NRP sudah terdaftar' 
      }, { status: 400 })
    }
    
    if (error?.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed' 
      }, { status: 503 })
    }

    if (error?.code === 'P1002') {
      return NextResponse.json({ 
        error: 'Database timeout' 
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Terjadi kesalahan saat membuat admin user',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: error?.code || 'UNKNOWN'
    }, { status: 500 })
  } finally {
    // Close database connection
    try {
      await prisma.$disconnect()
      console.log('✅ Database disconnected')
    } catch (error) {
      console.error('❌ Error disconnecting database:', error)
    }
  }
}

// GET endpoint untuk info setup
export async function GET() {
  return NextResponse.json({
    message: 'Admin Setup Endpoint',
    description: 'POST ke endpoint ini untuk membuat user admin yang sudah di-approve',
    required_fields: {
      name: 'string - Nama lengkap admin',
      email: 'string - Email admin (harus unik)',
      password: 'string - Password minimal 8 karakter',
      nrp: 'string - NRP admin (harus unik)',
      secretKey: 'string - Secret key untuk keamanan'
    },
    example: {
      name: "Administrator",
      email: "admin@police-inventory.com",
      password: "admin123456",
      nrp: "ADMIN001",
      secretKey: "admin-setup-2024"
    },
    note: "Secret key default: admin-setup-2024 (bisa diubah via environment variable ADMIN_SETUP_SECRET)",
    status: "✅ Endpoint ready"
  })
}
