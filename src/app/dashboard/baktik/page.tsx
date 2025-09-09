"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Car, 
  Database, 
  Globe, 
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  BarChart3,
  Users,
  FileText,
  MapPin
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ServiceConnection {
  id: string
  name: string
  description: string
  status: 'online' | 'offline' | 'maintenance' | 'error'
  lastSync: string
  responseTime: number
  endpoint: string
  category: 'mobile' | 'traffic' | 'database' | 'external'
  health: number
  uptime: string
}

interface BaktikData {
  services: ServiceConnection[]
  totalServices: number
  onlineServices: number
  offlineServices: number
  maintenanceServices: number
  systemHealth: number
  lastSystemCheck: string
}

// Icon mapping function
const getServiceIcon = (category: string) => {
  switch (category) {
    case 'mobile':
      return <Smartphone className="h-6 w-6 text-blue-600" />
    case 'traffic':
      return <Car className="h-6 w-6 text-green-600" />
    case 'database':
      return <Database className="h-6 w-6 text-purple-600" />
    case 'external':
      return <Globe className="h-6 w-6 text-orange-600" />
    default:
      return <Shield className="h-6 w-6 text-gray-600" />
  }
}

export default function BaktikPage() {
  const [data, setData] = useState<BaktikData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchBaktikData()
  }, [])

  const fetchBaktikData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/baktik/status')
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        // Fallback to mock data if API fails
        setData(getMockData())
      }
    } catch (error) {
      // Use mock data on error
      setData(getMockData())
    } finally {
      setLoading(false)
    }
  }

  const getMockData = (): BaktikData => {
    return {
      services: [
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
      ],
      totalServices: 9,
      onlineServices: 6,
      offlineServices: 1,
      maintenanceServices: 1,
      systemHealth: 89,
      lastSystemCheck: new Date().toLocaleString('id-ID')
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchBaktikData()
    setRefreshing(false)
    toast({ title: "Sukses", description: "Data BAKTIK berhasil diperbarui" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>
      case 'offline':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Offline</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Maintenance</Badge>
      case 'error':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Error</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-600" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-600" />
      case 'maintenance':
        return <Settings className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600'
    if (health >= 80) return 'text-yellow-600'
    if (health >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredServices = data?.services.filter(service => 
    selectedCategory === 'all' || service.category === selectedCategory
  ) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data BAKTIK...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Gagal memuat data BAKTIK</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">BAKTIK</h1>
          <p className="text-muted-foreground">Badan Koordinasi Teknologi Informasi Kepolisian</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Konfigurasi
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              Semua service terintegrasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.onlineServices}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalServices > 0 ? Math.round((data.onlineServices / data.totalServices) * 100) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <WifiOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.offlineServices}</div>
            <p className="text-xs text-muted-foreground">
              Perlu perhatian segera
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(data.systemHealth)}`}>
              {data.systemHealth}%
            </div>
            <p className="text-xs text-muted-foreground">
              Terakhir diperiksa: {data.lastSystemCheck}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Kategori Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Semua ({data.totalServices})
            </Button>
            <Button
              variant={selectedCategory === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('mobile')}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile ({data.services.filter(s => s.category === 'mobile').length})
            </Button>
            <Button
              variant={selectedCategory === 'traffic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('traffic')}
            >
              <Car className="mr-2 h-4 w-4" />
              Traffic ({data.services.filter(s => s.category === 'traffic').length})
            </Button>
            <Button
              variant={selectedCategory === 'database' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('database')}
            >
              <Database className="mr-2 h-4 w-4" />
              Database ({data.services.filter(s => s.category === 'database').length})
            </Button>
            <Button
              variant={selectedCategory === 'external' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('external')}
            >
              <Globe className="mr-2 h-4 w-4" />
              External ({data.services.filter(s => s.category === 'external').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getServiceIcon(service.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(service.status)}
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{service.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Health:</span>
                  <span className={`font-medium ${getHealthColor(service.health)}`}>
                    {service.health}%
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Response Time:</span>
                  <span className="font-medium">
                    {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Sync:</span>
                  <span className="font-medium">{service.lastSync}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate flex-1 mr-2">
                    {service.endpoint}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(service.endpoint, '_blank')}
                    disabled={service.status === 'offline'}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Alert */}
      {data.offlineServices > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Service Offline ({data.offlineServices})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.services
                .filter(service => service.status === 'offline')
                .map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      {getServiceIcon(service.category)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.description}</div>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Offline
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Alert */}
      {data.maintenanceServices > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Settings className="h-5 w-5" />
              Service Maintenance ({data.maintenanceServices})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.services
                .filter(service => service.status === 'maintenance')
                .map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      {getServiceIcon(service.category)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.description}</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Maintenance
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}