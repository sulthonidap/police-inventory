"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building, MapPin, Users, Package, FileText, Calendar, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Polda {
  id: string
  name: string
  code: string
  address: string
  phone: string
  email: string
  createdAt: string
  updatedAt: string
  _count: {
    polres: number
    users: number
    assets: number
    reports: number
  }
}

interface Polres {
  id: string
  name: string
  code: string
  address: string
  phone: string
  email: string
  createdAt: string
  _count: {
    users: number
    assets: number
    reports: number
  }
}

export default function PoldaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [polda, setPolda] = useState<Polda | null>(null)
  const [polres, setPolres] = useState<Polres[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPoldaDetail()
      fetchPolresList()
    }
  }, [params.id])

  const fetchPoldaDetail = async () => {
    try {
      const response = await fetch(`/api/polda/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPolda(data)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data Polda",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching polda:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      })
    }
  }

  const fetchPolresList = async () => {
    try {
      const response = await fetch(`/api/polres?poldaId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPolres(data.polres || [])
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data Polres",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching polres:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data Polres",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/dashboard/polda")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!polda) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Polda Tidak Ditemukan</h2>
        <Button onClick={handleBack}>Kembali ke Daftar Polda</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">{polda.name}</h1>
            <p className="text-gray-600">Detail Polda dan Daftar Polres</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {polda.code}
        </Badge>
      </div>

      {/* Polda Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Informasi Polda</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Polda</label>
              <p className="text-lg font-semibold">{polda.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Kode</label>
              <p className="text-lg">{polda.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Alamat</label>
              <p className="text-sm">{polda.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telepon</label>
              <p className="text-sm">{polda.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{polda.email}</p>
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
                <div className="text-2xl font-bold text-blue-600">{polda._count.polres}</div>
                <div className="text-sm text-gray-600">Polres</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{polda._count.users}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{polda._count.assets}</div>
                <div className="text-sm text-gray-600">Assets</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{polda._count.reports}</div>
                <div className="text-sm text-gray-600">Reports</div>
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
              <p className="text-sm">{formatDate(polda.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Terakhir Update</label>
              <p className="text-sm">{formatDate(polda.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Polres List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Daftar Polres ({polres.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {polres.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada Polres yang terdaftar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Polres</TableHead>
                    <TableHead>Kode</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Statistik</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polres.map((polresItem) => (
                    <TableRow key={polresItem.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{polresItem.name}</div>
                          <div className="text-sm text-gray-500">{polresItem.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{polresItem.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{polresItem.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{polresItem.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {polresItem._count.users} Users
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {polresItem._count.assets} Assets
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {polresItem._count.reports} Reports
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(polresItem.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
