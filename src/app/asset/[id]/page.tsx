"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Hash, Building, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface Asset {
  id: string
  name: string
  category: string
  status: string
  kind?: string | null
  categoryLevel1?: string | null
  categoryLevel2?: string | null
  categoryLevel3?: string | null
  source?: string | null
  inventoryNumber?: string | null
  qrData?: string | null
  createdAt: string
  updatedAt: string
  polres?: {
    id: string
    name: string
    polda?: {
      id: string
      name: string
    }
  } | null
  polda?: {
    id: string
    name: string
  } | null
  user?: {
    id: string
    name: string
    nrp: string
  } | null
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAsset()
  }, [])

  const fetchAsset = async () => {
    try {
      const { id } = await params
      const response = await fetch(`/api/assets/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAsset(data)
      } else {
        setError("Asset tidak ditemukan")
      }
    } catch (err) {
      setError("Gagal memuat data asset")
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
      {kind === 'DIGITAL' ? 'Digital' : 'Fisik'}
    </Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data asset...</p>
        </div>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">
              <FileText className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Asset Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{asset.name}</h1>
            <p className="text-gray-600">Detail Informasi Asset</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informasi Utama */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informasi Utama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Jenis</label>
                  <div className="mt-1">{getKindBadge(asset.kind)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Kategori</label>
                <p className="mt-1 text-gray-900">{asset.categoryLevel3 || asset.category || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Sumber Pendanaan</label>
                <p className="mt-1 text-gray-900">{asset.source || '-'}</p>
              </div>

                             <div>
                 <label className="text-sm font-medium text-gray-500">Nomor Inventaris</label>
                 <p className="mt-1 text-gray-900 font-mono">{asset.inventoryNumber || '-'}</p>
               </div>
               
               <div>
                 <label className="text-sm font-medium text-gray-500">Tahun</label>
                 <p className="mt-1 text-gray-900">{new Date(asset.createdAt).getFullYear()}</p>
               </div>
            </CardContent>
          </Card>

          {/* Lokasi & Penugasan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lokasi & Penugasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Polda</label>
                <p className="mt-1 text-gray-900">{asset.polda?.name || asset.polres?.polda?.name || '-'}</p>
              </div>

                             <div>
                 <label className="text-sm font-medium text-gray-500">Polres</label>
                 <p className="mt-1 text-gray-900">{asset.polres?.name || '-'}</p>
               </div>
            </CardContent>
          </Card>

          {/* Informasi Sistem */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Informasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Dibuat</label>
                  <p className="mt-1 text-gray-900">{formatDate(asset.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Terakhir Diupdate</label>
                  <p className="mt-1 text-gray-900">{formatDate(asset.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Sistem Inventaris Asset Kepolisian
          </p>
        </div>
      </div>
    </div>
  )
}
