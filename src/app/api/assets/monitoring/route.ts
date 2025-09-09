import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Role-based filtering
    const where: any = {}
    if (session.user.role === 'POLDA' && session.user.poldaId) {
      where.poldaId = session.user.poldaId
    } else if (session.user.role === 'POLRES' && session.user.polresId) {
      where.polresId = session.user.polresId
    } else if (session.user.role === 'USER' && session.user.polresId) {
      where.polresId = session.user.polresId
    }

    // Get all assets for statistics
    const assets = await prisma.asset.findMany({
      where,
      include: {
        polres: { 
          select: { 
            id: true, 
            name: true,
            polda: { select: { id: true, name: true } }
          } 
        },
        user: { select: { id: true, name: true, nrp: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate statistics
    const stats = {
      total: assets.length,
      active: assets.filter(a => a.status === 'ACTIVE').length,
      maintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
      damaged: assets.filter(a => a.status === 'DAMAGED').length,
      transferred: assets.filter(a => a.status === 'TRANSFERRED').length,
      lost: assets.filter(a => a.status === 'LOST').length,
      retired: assets.filter(a => a.status === 'RETIRED').length,
      digital: assets.filter(a => a.kind === 'DIGITAL').length,
      physical: assets.filter(a => a.kind === 'BARANG').length
    }

    // Get assets that need maintenance (example logic)
    const maintenanceDue = assets.filter(asset => {
      // Simple logic: assets that are ACTIVE but haven't been updated in 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      return asset.status === 'ACTIVE' && 
             new Date(asset.updatedAt) < sixMonthsAgo
    }).slice(0, 10) // Limit to 10 items

    // Get recent activities (simplified - in real app, you'd have an activities table)
    const recentActivities = assets
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(asset => ({
        id: asset.id,
        type: 'asset_updated',
        description: `Aset "${asset.name}" diperbarui`,
        timestamp: asset.updatedAt,
        asset: {
          id: asset.id,
          name: asset.name,
          status: asset.status
        }
      }))

    // Get low stock items (for items that might have quantity - simplified)
    const lowStockItems = assets
      .filter(asset => asset.status === 'ACTIVE' && asset.kind === 'BARANG')
      .slice(0, 5) // Example: first 5 physical assets as "low stock"

    return NextResponse.json({
      assets,
      stats,
      recentActivities,
      maintenanceDue,
      lowStockItems
    })

  } catch (error: any) {
    console.error('Error fetching monitoring data:', error)
    
    // Handle specific Prisma errors
    if (error?.code === 'P1001') {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}
