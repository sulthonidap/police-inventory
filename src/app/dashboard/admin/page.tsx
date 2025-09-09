"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateAdminButton } from "@/components/admin/CreateAdminButton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Shield, 
  Users, 
  RefreshCw, 
  Copy, 
  Check,
  Eye,
  EyeOff
} from "lucide-react"

interface AdminUser {
  id: string
  name: string
  email: string
  nrp: string
  role: string
  status: string
  createdAt: string
}

export default function AdminPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/approved')
      if (response.ok) {
        const users = await response.json()
        const adminUsers = users.filter((user: AdminUser) => user.role === 'ADMIN')
        setAdmins(adminUsers)
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Gagal memuat data admin",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleCopyCredentials = (email: string, password: string = "admin123456") => {
    const credentials = `Email: ${email}\nPassword: ${password}`
    navigator.clipboard.writeText(credentials)
    setCopiedId(email)
    setTimeout(() => setCopiedId(null), 2000)
    
    toast({
      title: "📋 Copied!",
      description: "Login credentials copied to clipboard",
    })
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'KORLANTAS': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'POLDA': 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      'POLRES': 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      'USER': 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
    return roleColors[role as keyof typeof roleColors] || 'bg-gradient-to-r from-gray-500 to-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Management</h1>
          <p className="text-gray-600">Kelola admin users dan akses sistem</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchAdmins}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <CreateAdminButton onSuccess={fetchAdmins} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Admins</CardTitle>
            <Shield className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{admins.length}</div>
            <p className="text-xs text-gray-500">Active admin users</p>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Users</CardTitle>
            <Users className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{admins.filter(a => a.status === 'APPROVED').length}</div>
            <p className="text-xs text-gray-500">Ready to login</p>
          </CardContent>
        </Card>

        <Card className="modern-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Default Password</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
              className="h-6 w-6 p-0"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {showPasswords ? "admin123456" : "••••••••"}
            </div>
            <p className="text-xs text-gray-500">All admins use same password</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin List */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Users List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading admins...</span>
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No admin users found</p>
              <p className="text-sm">Create your first admin user</p>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{admin.name}</h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs text-white ${getRoleBadge(admin.role)}`}>
                          {admin.role}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          NRP: {admin.nrp}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCredentials(admin.email)}
                      className="flex items-center gap-1"
                    >
                      {copiedId === admin.email ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy Login
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Login Info */}
      <Card className="modern-card bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">🚀 Quick Login Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-blue-700">
            <p><strong>Login URL:</strong> <a href="https://police-inventory.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline">https://police-inventory.vercel.app/</a></p>
            <p><strong>Default Password:</strong> admin123456</p>
            <p><strong>Note:</strong> All admin users use the same default password for easy access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
