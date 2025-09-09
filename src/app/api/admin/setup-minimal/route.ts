import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Minimal admin setup request received')
    
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
      },
      select: {
        id: true,
        email: true,
        nrp: true
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

    // Buat user admin dengan schema minimal - hanya field yang pasti ada di semua database
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        nrp,
        role: 'ADMIN',
        status: 'APPROVED'
        // Tidak menggunakan accountType dan field lainnya yang mungkin belum ada
      },
      select: {
        id: true,
        name: true,
        email: true,
        nrp: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log('✅ Admin user created successfully:', adminUser.id)

    return NextResponse.json({
      success: true,
      message: 'Admin user berhasil dibuat dan langsung di-approve',
      user: adminUser
    }, { status: 201 })

  } catch (error: any) {
    console.error('💥 Error creating admin user:', error)
    
    // Return error yang lebih detail untuk debugging
    return NextResponse.json({
      error: 'Terjadi kesalahan saat membuat admin user',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 })
  }
}
