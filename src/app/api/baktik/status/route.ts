import { NextRequest, NextResponse } from "next/server"
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

    // Mock data untuk BAKTIK services
    // Dalam implementasi nyata, ini akan melakukan health check ke service-service yang sebenarnya
    const mockServices = [
      {
        id: 'etle-mobile',
        name: 'ETLE Mobile',
        description: 'Sistem tilang elektronik mobile untuk petugas lapangan',
        status: 'online',
        lastSync: '2 menit yang lalu',
        responseTime: 45,
        endpoint: 'https://etle-mobile.polri.go.id',
        category: 'mobile',
        health: 98,
        uptime: '99.9%'
      },
      {
        id: 'etle-fixed',
        name: 'ETLE Fixed Camera',
        description: 'Sistem kamera tilang elektronik di jalan raya',
        status: 'online',
        lastSync: '1 menit yang lalu',
        responseTime: 23,
        endpoint: 'https://etle-fixed.polri.go.id',
        category: 'traffic',
        health: 95,
        uptime: '99.7%'
      },
      {
        id: 'sim-polda',
        name: 'SIM Polda',
        description: 'Sistem Informasi Manajemen Polda terintegrasi',
        status: 'online',
        lastSync: '30 detik yang lalu',
        responseTime: 12,
        endpoint: 'https://sim.polda.go.id',
        category: 'database',
        health: 99,
        uptime: '99.8%'
      },
      {
        id: 'e-tilang',
        name: 'E-Tilang',
        description: 'Sistem tilang elektronik terintegrasi',
        status: 'maintenance',
        lastSync: '1 jam yang lalu',
        responseTime: 0,
        endpoint: 'https://e-tilang.polri.go.id',
        category: 'external',
        health: 0,
        uptime: '98.5%'
      },
      {
        id: 'polres-mobile',
        name: 'Polres Mobile App',
        description: 'Aplikasi mobile untuk operasional Polres',
        status: 'online',
        lastSync: '5 menit yang lalu',
        responseTime: 67,
        endpoint: 'https://polres-mobile.polri.go.id',
        category: 'mobile',
        health: 92,
        uptime: '99.2%'
      },
      {
        id: 'traffic-monitor',
        name: 'Traffic Monitor',
        description: 'Sistem monitoring lalu lintas real-time',
        status: 'online',
        lastSync: '3 menit yang lalu',
        responseTime: 34,
        endpoint: 'https://traffic.polri.go.id',
        category: 'traffic',
        health: 96,
        uptime: '99.4%'
      },
      {
        id: 'personnel-system',
        name: 'Personnel Management',
        description: 'Sistem manajemen personel kepolisian',
        status: 'offline',
        lastSync: '2 jam yang lalu',
        responseTime: 0,
        endpoint: 'https://personnel.polri.go.id',
        category: 'database',
        health: 0,
        uptime: '97.8%'
      },
      {
        id: 'emergency-response',
        name: 'Emergency Response',
        description: 'Sistem tanggap darurat dan koordinasi',
        status: 'online',
        lastSync: '1 menit yang lalu',
        responseTime: 15,
        endpoint: 'https://emergency.polri.go.id',
        category: 'external',
        health: 100,
        uptime: '99.9%'
      },
      {
        id: 'gis-mapping',
        name: 'GIS Mapping',
        description: 'Sistem pemetaan geografis dan lokasi',
        status: 'online',
        lastSync: '4 menit yang lalu',
        responseTime: 89,
        endpoint: 'https://gis.polri.go.id',
        category: 'external',
        health: 88,
        uptime: '98.9%'
      }
    ]

    // Simulasi health check dengan variasi status
    const servicesWithHealthCheck = mockServices.map(service => {
      // Simulasi random status untuk demo
      const random = Math.random()
      let status = service.status
      let health = service.health
      let responseTime = service.responseTime

      if (random < 0.1) { // 10% chance untuk status offline
        status = 'offline'
        health = 0
        responseTime = 0
      } else if (random < 0.15) { // 5% chance untuk maintenance
        status = 'maintenance'
        health = Math.floor(Math.random() * 30)
        responseTime = 0
      } else if (random < 0.2) { // 5% chance untuk error
        status = 'error'
        health = Math.floor(Math.random() * 50) + 20
        responseTime = Math.floor(Math.random() * 200) + 100
      } else {
        // Normal operation dengan sedikit variasi
        health = Math.max(80, Math.min(100, health + Math.floor(Math.random() * 20) - 10))
        responseTime = Math.max(10, responseTime + Math.floor(Math.random() * 20) - 10)
      }

      return {
        ...service,
        status,
        health,
        responseTime,
        lastSync: status === 'offline' ? '2 jam yang lalu' : 
                 status === 'maintenance' ? '1 jam yang lalu' :
                 `${Math.floor(Math.random() * 5) + 1} menit yang lalu`
      }
    })

    // Calculate statistics
    const totalServices = servicesWithHealthCheck.length
    const onlineServices = servicesWithHealthCheck.filter(s => s.status === 'online').length
    const offlineServices = servicesWithHealthCheck.filter(s => s.status === 'offline').length
    const maintenanceServices = servicesWithHealthCheck.filter(s => s.status === 'maintenance').length
    const errorServices = servicesWithHealthCheck.filter(s => s.status === 'error').length

    // Calculate system health
    const totalHealth = servicesWithHealthCheck.reduce((sum, service) => sum + service.health, 0)
    const systemHealth = Math.round(totalHealth / totalServices)

    return NextResponse.json({
      services: servicesWithHealthCheck,
      totalServices,
      onlineServices,
      offlineServices,
      maintenanceServices,
      errorServices,
      systemHealth,
      lastSystemCheck: new Date().toLocaleString('id-ID'),
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error fetching BAKTIK status:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch BAKTIK status' },
      { status: 500 }
    )
  }
}

// Health check endpoint untuk individual services
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceId } = await request.json()

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    // Simulasi health check untuk service tertentu
    const startTime = Date.now()
    
    // Simulasi delay network
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 100))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.1 // 90% success rate

    return NextResponse.json({
      serviceId,
      status: isHealthy ? 'online' : 'offline',
      responseTime,
      health: isHealthy ? Math.floor(Math.random() * 20) + 80 : 0,
      timestamp: new Date().toISOString(),
      message: isHealthy ? 'Service is healthy' : 'Service is experiencing issues'
    })

  } catch (error: any) {
    console.error('Error performing health check:', error)
    
    return NextResponse.json(
      { error: 'Failed to perform health check' },
      { status: 500 }
    )
  }
}
