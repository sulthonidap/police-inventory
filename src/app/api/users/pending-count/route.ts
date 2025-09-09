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
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000)
    })

    const countPromise = prisma.user.count({
      where: {
        status: 'PENDING'
      }
    })

    const count = await Promise.race([countPromise, timeoutPromise]) as number

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting pending users:', error)
    
    // Return 0 as fallback instead of error to prevent sidebar blocking
    return NextResponse.json({ count: 0 })
  }
}
