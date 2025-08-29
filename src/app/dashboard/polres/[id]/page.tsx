"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building, MapPin, Users, Package, FileText, Calendar, Phone, Mail, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Polres {
  id: string
  name: string
  address: string
  phone: string
  createdAt: string
  updatedAt: string
  polda: {
    id: string
    name: string
  }
  _count: {
    users: number
    assets: number
    reports: number
  }
}

interface User {
  id: string
  name: string
  email: string
  nrp: string
  role: string
  status: string
  createdAt: string
}

interface Asset {
  id: string
  name: string
  category: string
  status: string
  inventoryNumber: string
  year: number
  createdAt: string
}

interface Report {
  id: string
  title: string
  type: string
  customType?: string
  status: string
  createdAt: string
  user: {
    name: string
  }
}

export default function PolresDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [polres, setPolres] = useState<Polres | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPolresDetail()
      fetchRelatedData()
    }
  }, [params.id])

  const fetchPolresDetail = async () => {
    try {
      console.log('Fetching polres detail for ID:', params.id)
      const response = await fetch(`/api/polres/${params.id}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Polres data:', data)
        setPolres(data)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast({
          title: "Error",
          description: errorData.error || "Gagal memuat data Polres",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching polres:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      })
    }
  }

  const fetchRelatedData = async () => {
    try {
      console.log('Fetching related data for polres ID:', params.id)
      
      // Fetch users
      const usersResponse = await fetch(`/api/users?polresId=${params.id}&limit=5`)
      console.log('Users response status:', usersResponse.status)
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        console.log('Users data:', usersData)
        setUsers(usersData.users || [])
      } else {
        console.error('Failed to fetch users:', await usersResponse.text())
      }

      // Fetch assets
      const assetsResponse = await fetch(`/api/assets?polresId=${params.id}&limit=5`)
      console.log('Assets response status:', assetsResponse.status)
      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json()
        console.log('Assets data:', assetsData)
        setAssets(assetsData.assets || [])
      } else {
        console.error('Failed to fetch assets:', await assetsResponse.text())
      }

      // Fetch reports
      const reportsResponse = await fetch(`/api/reports?polresId=${params.id}&limit=5`)
      console.log('Reports response status:', reportsResponse.status)
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        console.log('Reports data:', reportsData)
        setReports(reportsData.reports || [])
      } else {
        console.error('Failed to fetch reports:', await reportsResponse.text())
      }
    } catch (error) {
      console.error("Error fetching related data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/dashboard/polres")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-purple-100 text-purple-800',
      'KORLANTAS': 'bg-blue-100 text-blue-800',
      'POLDA': 'bg-indigo-100 text-indigo-800',
      'POLRES': 'bg-cyan-100 text-cyan-800',
      'USER': 'bg-gray-100 text-gray-800'
    }
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const getAssetStatusBadge = (status: string) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
      'RETIRED': 'bg-red-100 text-red-800',
      'LOST': 'bg-gray-100 text-gray-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  const getReportTypeBadge = (type: string, customType?: string) => {
    if (type === 'CUSTOM' && customType) {
      return <Badge variant="outline" className="text-xs">{customType}</Badge>
    }
    
    const typeColors = {
      'UMUM': 'bg-blue-100 text-blue-800',
      'INTERNAL': 'bg-purple-100 text-purple-800',
      'CUSTOM': 'bg-orange-100 text-orange-800'
    }
    return <Badge className={`text-xs ${typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!polres) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Polres Tidak Ditemukan</h2>
        <Button onClick={handleBack}>Kembali ke Daftar Polres</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{polres.name}</h1>
            <p className="text-gray-600">Detail Polres dan Data Terkait</p>
          </div>
        </div>
                 <div className="flex items-center space-x-2">
           <Badge variant="outline" className="text-sm">
             {polres.polda.name}
           </Badge>
         </div>
      </div>

      {/* Polres Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Informasi Polres</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Polres</label>
              <p className="text-lg font-semibold">{polres.name}</p>
            </div>
            
                         <div>
               <label className="text-sm font-medium text-gray-500">Polda</label>
               <p className="text-sm">{polres.polda.name}</p>
             </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Alamat</label>
              <p className="text-sm">{polres.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telepon</label>
              <p className="text-sm">{polres.phone}</p>
            </div>
            
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Statistik</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{polres._count.users}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{polres._count.assets}</div>
                <div className="text-sm text-gray-600">Assets</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{polres._count.reports}</div>
                <div className="text-sm text-gray-600">Reports</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((polres._count.assets / Math.max(polres._count.users, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Asset/User</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Dibuat</label>
              <p className="text-sm">{formatDate(polres.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Terakhir Update</label>
              <p className="text-sm">{formatDate(polres.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related Data Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Users ({users.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada users</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">NRP: {user.nrp}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={`text-xs ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </Badge>
                      <Badge className={`text-xs ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Assets ({assets.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada assets</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs text-gray-500">{asset.category}</div>
                      <div className="text-xs text-gray-400">No: {asset.inventoryNumber}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={`text-xs ${getAssetStatusBadge(asset.status)}`}>
                        {asset.status}
                      </Badge>
                      <div className="text-xs text-gray-500">{asset.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Reports ({reports.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada reports</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{report.title}</div>
                      <div className="text-xs text-gray-500">by {report.user.name}</div>
                      <div className="text-xs text-gray-400">{formatDate(report.createdAt)}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getReportTypeBadge(report.type, report.customType)}
                      <Badge className={`text-xs ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
