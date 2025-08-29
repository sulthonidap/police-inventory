"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Package, 
  FileText, 
  Building
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalAssets: number
  totalReports: number
  totalPolres: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAssets: 0,
    totalReports: 0,
    totalPolres: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch data from API dengan pagination untuk mendapatkan total count
      const [usersRes, assetsRes, reportsRes, polresRes] = await Promise.all([
        fetch('/api/users?limit=1'), // Hanya ambil 1 untuk mendapatkan pagination info
        fetch('/api/assets?limit=1'),
        fetch('/api/reports?limit=1'),
        fetch('/api/polres?limit=1')
      ])

      const usersData = await usersRes.json()
      const assetsData = await assetsRes.json()
      const reportsData = await reportsRes.json()
      const polresData = await polresRes.json()

      // Ambil total dari pagination jika tersedia, atau dari array length
      const totalUsers = usersData.pagination?.total || usersData.users?.length || usersData.length || 0
      const totalAssets = assetsData.pagination?.total || assetsData.assets?.length || assetsData.length || 0
      const totalReports = reportsData.pagination?.total || reportsData.reports?.length || reportsData.length || 0
      const totalPolres = polresData.pagination?.total || polresData.polres?.length || polresData.length || 0

      setStats({
        totalUsers,
        totalAssets,
        totalReports,
        totalPolres
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di Police Inventory Management System</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="modern-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500">Pengguna terdaftar</p>
          </CardContent>
        </Card>

        <Card className="modern-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Assets</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalAssets}</div>
            <p className="text-xs text-gray-500">Asset terdaftar</p>
          </CardContent>
        </Card>

        <Card className="modern-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalReports}</div>
            <p className="text-xs text-gray-500">Laporan dibuat</p>
          </CardContent>
        </Card>

        <Card className="modern-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Polres</CardTitle>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalPolres}</div>
            <p className="text-xs text-gray-500">Polres terdaftar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
