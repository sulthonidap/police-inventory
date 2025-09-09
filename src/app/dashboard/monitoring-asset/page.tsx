"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Activity, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"

interface AssetStats {
  total: number
  active: number
  maintenance: number
  damaged: number
  transferred: number
  lost: number
  retired: number
  digital: number
  physical: number
}

interface Asset {
  id: string
  name: string
  category: string
  status: string
  kind?: string
  polres: { id: string; name: string; polda?: { id: string; name: string } } | null
  user: { id: string; name: string; nrp: string } | null
  createdAt: Date | string
  updatedAt: Date | string
  inventoryNumber?: string
  year?: number
  source?: string
}

interface MonitoringData {
  assets: Asset[]
  stats: AssetStats
  recentActivities: any[]
  maintenanceDue: Asset[]
  lowStockItems: any[]
}

export default function MonitoringAssetPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kindFilter, setKindFilter] = useState("all")
  const [polresFilter, setPolresFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview")
  const { toast } = useToast()

  useEffect(() => {
    fetchMonitoringData()
  }, [])

  const fetchMonitoringData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/assets/monitoring')
      const result = await response.json()
      
      if (response.ok) {
        setData(result)
      } else {
        toast({ 
          title: "Error", 
          description: result.error || "Gagal memuat data monitoring", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Terjadi kesalahan saat memuat data", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case 'DAMAGED': return <Badge className="bg-red-100 text-red-800">Rusak</Badge>
      case 'TRANSFERRED': return <Badge className="bg-blue-100 text-blue-800">Ditransfer</Badge>
      case 'LOST': return <Badge className="bg-orange-100 text-orange-800">Hilang</Badge>
      case 'MAINTENANCE': return <Badge className="bg-yellow-100 text-yellow-800">Pemeliharaan</Badge>
      case 'RETIRED': return <Badge className="bg-gray-100 text-gray-800">Pensiun</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getKindBadge = (kind?: string | null) => {
    if (!kind) return <Badge variant="secondary">-</Badge>
    return <Badge className={kind === 'DIGITAL' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'}>
      {kind === 'DIGITAL' ? 'Digital' : kind === 'BARANG' ? 'Fisik' : kind}
    </Badge>
  }

  const filteredAssets = data?.assets.filter(asset => {
    const matchesSearch = searchQuery === "" || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.inventoryNumber && asset.inventoryNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    const matchesKind = kindFilter === "all" || asset.kind === kindFilter
    const matchesPolres = polresFilter === "all" || asset.polres?.id === polresFilter
    
    return matchesSearch && matchesStatus && matchesKind && matchesPolres
  }) || []

  const exportToExcel = () => {
    // Implementasi export ke Excel
    toast({ title: "Info", description: "Fitur export akan segera tersedia" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data monitoring...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Gagal memuat data monitoring</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Monitoring Aset</h1>
          <p className="text-muted-foreground">Dashboard monitoring dan analisis aset</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("overview")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={viewMode === "detailed" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("detailed")}
          >
            <PieChart className="mr-2 h-4 w-4" />
            Detail
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua aset terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.total > 0 ? Math.round((data.stats.active / data.stats.total) * 100) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu Perawatan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              Aset dalam pemeliharaan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Rusak</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.stats.damaged}</div>
            <p className="text-xs text-muted-foreground">
              Perlu perbaikan segera
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Digital</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{data.stats.digital}</div>
            <p className="text-xs text-muted-foreground">
              Software & Digital Assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Fisik</CardTitle>
            <Package className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{data.stats.physical}</div>
            <p className="text-xs text-muted-foreground">
              Hardware & Physical Assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Hilang</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.stats.lost}</div>
            <p className="text-xs text-muted-foreground">
              Perlu investigasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribusi Status Aset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Aktif', value: data.stats.active, color: '#10b981' },
                      { name: 'Pemeliharaan', value: data.stats.maintenance, color: '#f59e0b' },
                      { name: 'Rusak', value: data.stats.damaged, color: '#ef4444' },
                      { name: 'Hilang', value: data.stats.lost, color: '#f97316' },
                      { name: 'Ditransfer', value: data.stats.transferred, color: '#3b82f6' },
                      { name: 'Pensiun', value: data.stats.retired, color: '#6b7280' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Aktif', value: data.stats.active, color: '#10b981' },
                      { name: 'Pemeliharaan', value: data.stats.maintenance, color: '#f59e0b' },
                      { name: 'Rusak', value: data.stats.damaged, color: '#ef4444' },
                      { name: 'Hilang', value: data.stats.lost, color: '#f97316' },
                      { name: 'Ditransfer', value: data.stats.transferred, color: '#3b82f6' },
                      { name: 'Pensiun', value: data.stats.retired, color: '#6b7280' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribusi Jenis Aset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Digital', value: data.stats.digital, color: '#6366f1' },
                  { name: 'Fisik', value: data.stats.physical, color: '#14b8a6' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {[
                      { name: 'Digital', value: data.stats.digital, color: '#6366f1' },
                      { name: 'Fisik', value: data.stats.physical, color: '#14b8a6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tren Aset Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', total: Math.floor(data.stats.total * 0.8) },
                { month: 'Feb', total: Math.floor(data.stats.total * 0.85) },
                { month: 'Mar', total: Math.floor(data.stats.total * 0.9) },
                { month: 'Apr', total: Math.floor(data.stats.total * 0.95) },
                { month: 'Mei', total: data.stats.total },
                { month: 'Jun', total: data.stats.total }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Aset</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Nama atau nomor inventaris..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="MAINTENANCE">Pemeliharaan</SelectItem>
                  <SelectItem value="DAMAGED">Rusak</SelectItem>
                  <SelectItem value="LOST">Hilang</SelectItem>
                  <SelectItem value="TRANSFERRED">Ditransfer</SelectItem>
                  <SelectItem value="RETIRED">Pensiun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kind">Jenis</Label>
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="DIGITAL">Digital</SelectItem>
                  <SelectItem value="BARANG">Fisik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aksi</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setKindFilter("all")
                  setPolresFilter("all")
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Aset ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Aset</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Polda/Polres</TableHead>
                  <TableHead>No. Inventaris</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Tidak ada data aset
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{getKindBadge(asset.kind)}</TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{asset.polres?.polda?.name || '-'}</div>
                          <div className="text-gray-500">{asset.polres?.name || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{asset.inventoryNumber || '-'}</TableCell>
                      <TableCell>{asset.year || '-'}</TableCell>
                      <TableCell>{asset.source || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/asset/${asset.id}`, '_blank')}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Due Alert */}
      {data.maintenanceDue && data.maintenanceDue.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Aset Perlu Perawatan ({data.maintenanceDue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.maintenanceDue.slice(0, 5).map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-gray-500">{asset.polres?.name}</div>
                  </div>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    Perlu Perawatan
                  </Badge>
                </div>
              ))}
              {data.maintenanceDue.length > 5 && (
                <div className="text-sm text-yellow-700 text-center pt-2">
                  Dan {data.maintenanceDue.length - 5} aset lainnya...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
