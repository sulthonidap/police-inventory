"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogOverlay } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Plus, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createAsset, updateAsset, deleteAsset, getAssets } from "@/lib/actions/assets"
import QRCode from "qrcode"
import { Loader2, Search } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface Asset {
  id: string
  name: string
  category: string
  status: string
  polresId: string
  assignedTo: string | null
  polres: { id: string; name: string } | null
  polda?: { id: string; name: string } | null
  user: { id: string; name: string; nrp: string } | null
  createdAt: Date | string
  updatedAt: Date | string
  kind?: string | null
  categoryLevel1?: string | null
  categoryLevel2?: string | null
  categoryLevel3?: string | null
  source?: string | null
  inventoryNumber?: string | null
  year?: number | null
  qrData?: string | null
}

interface Polres { id: string; name: string; polda?: { id: string; name: string } }
interface User { id: string; name: string; nrp: string }
interface Polda { id: string; name: string }

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [polres, setPolres] = useState<Polres[]>([])
  const [poldas, setPoldas] = useState<Polda[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isQrPreviewOpen, setIsQrPreviewOpen] = useState(false)
  const [qrPreview, setQrPreview] = useState<string>("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kindFilter, setKindFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isQrLoading, setIsQrLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    category: "LAINNYA",
    status: "ACTIVE",
    polresId: "",
    assignedTo: "",
    // extended
    kind: "",
    categoryLevel1: "",
    categoryLevel2: "",
    categoryLevel3: "",
    source: "",
    inventoryNumber: "",
    year: new Date().getFullYear().toString(),
    poldaId: "",
    qrData: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAssets()
    fetchPolres()
    fetchUsers()
    fetchPoldas()
  }, [])

  const fetchAssets = async () => {
    try {
      const result = await getAssets()
      if (result.assets) {
        setAssets(result.assets)
      } else if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data aset", variant: "destructive" })
    } finally { setLoading(false) }
  }

  const fetchPolres = async () => {
    try {
      const response = await fetch('/api/polres/simple')
      const data = await response.json()
      setPolres(data)
    } catch {}
  }
  const fetchPolresByPolda = async (poldaId: string) => {
    try {
      const response = await fetch(`/api/polres/simple?poldaId=${poldaId}`)
      const data = await response.json()
      setPolres(data)
    } catch {}
  }

  // Muat Polres saat Polda berubah di wizard
  useEffect(() => {
    if (formData.poldaId) {
      fetchPolresByPolda(formData.poldaId)
      // reset pilihan polres agar tidak salah asosiasi
      setFormData(prev => ({ ...prev, polresId: "" }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.poldaId])

  const fetchPoldas = async () => {
    try {
      const res = await fetch('/api/polda/simple')
      const data = await res.json()
      setPoldas(data)
    } catch {}
  }
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/approved')
      const data = await response.json()
      setUsers(data)
    } catch {}
  }

  const generateQr = async () => {
    // Generate QR dengan URL halaman public
    const baseUrl = window.location.origin
    const assetUrl = `${baseUrl}/asset/[ASSET_ID]` // Akan diganti dengan ID asset setelah disimpan
    
    // Untuk preview, gunakan URL dummy
    const previewUrl = `${baseUrl}/asset/preview`
    const dataUrl = await QRCode.toDataURL(previewUrl, { width: 256 })
    setFormData(prev => ({ ...prev, qrData: dataUrl }))
    setQrPreview(dataUrl)
    setIsQrPreviewOpen(true)
  }

  const openQrPreview = async (asset: Asset) => {
    setIsQrLoading(true)
    setIsQrPreviewOpen(true)
    
    try {
      if (asset.qrData && asset.qrData.startsWith('data:image')) {
        // Jika sudah ada QR data yang valid, gunakan yang ada
        setQrPreview(asset.qrData)
      } else {
        // Jika belum ada atau tidak valid, generate baru
        const baseUrl = window.location.origin
        const assetUrl = `${baseUrl}/asset/${asset.id}`
        const dataUrl = await QRCode.toDataURL(assetUrl, { 
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        // Update asset dengan QR data baru
        await fetch(`/api/assets/${asset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrData: dataUrl })
        })
        
        setQrPreview(dataUrl)
      }
    } catch (error) {
      console.error('Error generating QR:', error)
      toast({ title: "Error", description: 'Gagal generate QR Code', variant: 'destructive' })
    } finally {
      setIsQrLoading(false)
    }
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const body = {
        name: formData.name,
        category: formData.category,
        polresId: formData.polresId,
        assignedTo: formData.assignedTo === "none" ? null : formData.assignedTo || null,
        kind: formData.kind || null,
        categoryLevel1: formData.categoryLevel1 || null,
        categoryLevel2: formData.categoryLevel2 || null,
        categoryLevel3: formData.categoryLevel3 || null,
        source: formData.source || null,
        inventoryNumber: formData.inventoryNumber || null,
        year: formData.year ? parseInt(formData.year) : null,
        poldaId: formData.poldaId || null,
        qrData: null, // Akan diupdate setelah asset dibuat
      }
      const res = await fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const result = await res.json()
      if (res.ok) {
        // Generate QR dengan URL yang benar setelah asset dibuat
        const baseUrl = window.location.origin
        const assetUrl = `${baseUrl}/asset/${result.asset.id}`
        const qrDataUrl = await QRCode.toDataURL(assetUrl, { width: 256 })
        
        // Update asset dengan QR data yang benar
        await fetch(`/api/assets/${result.asset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, qrData: qrDataUrl })
        })
        
        toast({ title: "Sukses", description: result.success })
        setIsModalOpen(false); resetForm(); fetchAssets()
      } else {
        toast({ title: "Error", description: result.error || 'Gagal menambah aset', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: "Error", description: 'Terjadi kesalahan saat menyimpan aset', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset)
    setFormData({
      name: asset.name,
      category: asset.category,
      status: asset.status,
      polresId: asset.polresId,
      assignedTo: asset.assignedTo || "none",
      kind: asset.kind || "",
      categoryLevel1: asset.categoryLevel1 || "",
      categoryLevel2: asset.categoryLevel2 || "",
      categoryLevel3: asset.categoryLevel3 || "",
      source: asset.source || "",
      inventoryNumber: asset.inventoryNumber || "",
      year: asset.year?.toString() || new Date().getFullYear().toString(),
      poldaId: (asset as any).polda?.id || "",
      qrData: asset.qrData || "",
    })
    setIsEditModalOpen(true)
  }

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsset) return
    
    setIsSubmitting(true)

    try {
      const body = {
        name: formData.name,
        category: formData.category,
        status: formData.status,
        assignedTo: formData.assignedTo === "none" ? null : formData.assignedTo || null,
        kind: formData.kind || null,
        categoryLevel1: formData.categoryLevel1 || null,
        categoryLevel2: formData.categoryLevel2 || null,
        categoryLevel3: formData.categoryLevel3 || null,
        source: formData.source || null,
        inventoryNumber: formData.inventoryNumber || null,
        year: formData.year ? parseInt(formData.year) : null,
        poldaId: formData.poldaId || null,
        qrData: formData.qrData || null,
      }

      const res = await fetch(`/api/assets/${selectedAsset.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const result = await res.json()
      if (res.ok) {
        toast({ title: "Sukses", description: result.success || 'Asset berhasil diperbarui' })
        setIsEditModalOpen(false)
        resetForm(); fetchAssets()
      } else {
        toast({ title: "Error", description: result.error || 'Gagal memperbarui aset', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: "Error", description: 'Terjadi kesalahan saat memperbarui aset', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "LAINNYA",
      status: "ACTIVE",
      polresId: "",
      assignedTo: "none",
      kind: "",
      categoryLevel1: "",
      categoryLevel2: "",
      categoryLevel3: "",
      source: "",
      inventoryNumber: "",
      year: new Date().getFullYear().toString(),
      poldaId: "",
      qrData: "",
    })
         setSelectedAsset(null)
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

  // Filter assets berdasarkan search query dan filter
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchQuery === "" || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.categoryLevel3 && asset.categoryLevel3.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.inventoryNumber && asset.inventoryNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === "" || statusFilter === "all" || asset.status === statusFilter
    const matchesKind = kindFilter === "" || kindFilter === "all" || asset.kind === kindFilter
    
    return matchesSearch && matchesStatus && matchesKind
  })

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAssets = filteredAssets.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, kindFilter])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg">Memuat data aset...</div></div>
  }

  const downloadQR = () => {
    if (qrPreview) {
      const link = document.createElement('a');
      link.href = qrPreview;
      link.download = `asset-qr-${selectedAsset?.name || 'unknown'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Sukses", description: "QR Code berhasil diunduh" });
    }
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    try {
      const res = await deleteAsset(selectedAsset.id);
      if (res.success) {
        toast({ title: "Sukses", description: res.success });
        setIsDeleteDialogOpen(false);
        fetchAssets();
      } else {
        toast({ title: "Error", description: res.error || "Gagal menghapus aset", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus aset", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Manajemen Aset</h1>
          <p className="text-muted-foreground">Kelola data aset dan inventaris</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Aset
            </Button>
          </DialogTrigger>
          <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Aset Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Aset *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama aset"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kind">Jenis Aset *</Label>
                  <Select value={formData.kind} onValueChange={(value) => setFormData({ ...formData, kind: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis aset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DIGITAL">Digital</SelectItem>
                      <SelectItem value="BARANG">Fisik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KENDARAAN">Kendaraan</SelectItem>
                      <SelectItem value="SENJATA">Senjata</SelectItem>
                      <SelectItem value="PERALATAN">Peralatan</SelectItem>
                      <SelectItem value="KOMPUTER">Komputer</SelectItem>
                      <SelectItem value="KOMUNIKASI">Komunikasi</SelectItem>
                      <SelectItem value="LAINNYA">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Tahun</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="Tahun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Sumber</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sumber" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APBN">APBN</SelectItem>
                      <SelectItem value="HIBAH">Hibah</SelectItem>
                      <SelectItem value="KERJASAMA">Kerjasama</SelectItem>
                      <SelectItem value="LAINNYA">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryNumber">Nomor Inventaris</Label>
                  <Input
                    id="inventoryNumber"
                    value={formData.inventoryNumber}
                    onChange={(e) => setFormData({ ...formData, inventoryNumber: e.target.value })}
                    placeholder="Masukkan nomor inventaris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="polda">Polda</Label>
                  <Select value={formData.poldaId} onValueChange={(value) => setFormData({ ...formData, poldaId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Polda" />
                    </SelectTrigger>
                    <SelectContent>
                      {poldas.map((polda) => (
                        <SelectItem key={polda.id} value={polda.id}>
                          {polda.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="polres">Polres</Label>
                  <Select value={formData.polresId} onValueChange={(value) => setFormData({ ...formData, polresId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Polres" />
                    </SelectTrigger>
                    <SelectContent>
                      {polres.map((polres) => (
                        <SelectItem key={polres.id} value={polres.id}>
                          {polres.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Ditugaskan Kepada</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ditugaskan</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Cari nama aset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kind">Jenis</Label>
              <Select value={kindFilter} onValueChange={(value) => setKindFilter(value)}>
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
                }}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-4">
        {currentAssets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              Tidak ada data aset
            </CardContent>
          </Card>
        ) : (
          currentAssets.map((asset) => (
            <Card key={asset.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{asset.name}</h3>
                    <p className="text-sm text-gray-600">{asset.category || '-'}</p>
                    <p className="text-sm text-gray-500">No. Inventaris: {asset.inventoryNumber || '-'}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getKindBadge(asset.kind)}
                    {getStatusBadge(asset.status)}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Polda:</span> {asset.polda?.name || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Polres:</span> {asset.polres?.name || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Sumber:</span> {asset.source || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Tahun:</span> {asset.year || '-'}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100"
                    onClick={() => openQrPreview(asset)}
                    title="Lihat QR"
                  >
                    <Eye className="mr-1 h-3 w-3 text-white" />QR
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100"
                    onClick={() => openEditDialog(asset)}
                    title="Edit"
                  >
                    <Edit className="mr-1 h-3 w-3 text-white" />Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100"
                    onClick={() => { setSelectedAsset(asset); setIsDeleteDialogOpen(true) }}
                    title="Hapus"
                  >
                    <Trash2 className="mr-1 h-3 w-3 text-white" />Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block">
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Aset</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Polda</TableHead>
                  <TableHead>Polres</TableHead>
                  <TableHead>No. Inventaris</TableHead>
                  <TableHead className="w-[200px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Tidak ada data aset
                    </TableCell>
                  </TableRow>
                ) : (
                  currentAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{asset.category || '-'}</TableCell>
                      <TableCell>{getKindBadge(asset.kind)}</TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell>{asset.polda?.name || '-'}</TableCell>
                      <TableCell>{asset.polres?.name || '-'}</TableCell>
                      <TableCell>{asset.inventoryNumber || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100"
                            onClick={() => openQrPreview(asset)}
                            title="Lihat QR"
                          >
                            <Eye className="mr-1 h-3 w-3 text-white" />QR
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100"
                            onClick={() => openEditDialog(asset)}
                            title="Edit"
                          >
                            <Edit className="mr-1 h-3 w-3 text-white" />Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100"
                            onClick={() => { setSelectedAsset(asset); setIsDeleteDialogOpen(true) }}
                            title="Hapus"
                          >
                            <Trash2 className="mr-1 h-3 w-3 text-white" />Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center mt-4 text-sm text-gray-500">
                Menampilkan {startIndex + 1} - {endIndex} dari {filteredAssets.length} data
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Aset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAsset} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Aset *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama aset"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kind">Jenis Aset *</Label>
                <Select value={formData.kind} onValueChange={(value) => setFormData({ ...formData, kind: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis aset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIGITAL">Digital</SelectItem>
                    <SelectItem value="BARANG">Fisik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KENDARAAN">Kendaraan</SelectItem>
                    <SelectItem value="SENJATA">Senjata</SelectItem>
                    <SelectItem value="PERALATAN">Peralatan</SelectItem>
                    <SelectItem value="KOMPUTER">Komputer</SelectItem>
                    <SelectItem value="KOMUNIKASI">Komunikasi</SelectItem>
                    <SelectItem value="LAINNYA">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Tahun</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="Tahun"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-source">Sumber</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sumber" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APBN">APBN</SelectItem>
                    <SelectItem value="HIBAH">Hibah</SelectItem>
                    <SelectItem value="KERJASAMA">Kerjasama</SelectItem>
                    <SelectItem value="LAINNYA">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-inventoryNumber">Nomor Inventaris</Label>
                <Input
                  id="edit-inventoryNumber"
                  value={formData.inventoryNumber}
                  onChange={(e) => setFormData({ ...formData, inventoryNumber: e.target.value })}
                  placeholder="Masukkan nomor inventaris"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-polda">Polda</Label>
                <Select value={formData.poldaId} onValueChange={(value) => setFormData({ ...formData, poldaId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Polda" />
                  </SelectTrigger>
                  <SelectContent>
                    {poldas.map((polda) => (
                      <SelectItem key={polda.id} value={polda.id}>
                        {polda.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-polres">Polres</Label>
                <Select value={formData.polresId} onValueChange={(value) => setFormData({ ...formData, polresId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Polres" />
                  </SelectTrigger>
                  <SelectContent>
                    {polres.map((polres) => (
                      <SelectItem key={polres.id} value={polres.id}>
                        {polres.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assignedTo">Ditugaskan Kepada</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ditugaskan</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Preview Modal */}
      <Dialog open={isQrPreviewOpen} onOpenChange={setIsQrPreviewOpen}>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Aset</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {isQrLoading ? (
              <div className="p-4 bg-gray-100 rounded-lg border w-48 h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Generating QR Code...</p>
                </div>
              </div>
            ) : qrPreview ? (
              <div className="p-4 bg-white rounded-lg border">
                <img src={qrPreview} alt="QR Code" className="w-48 h-48 mx-auto" />
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg border w-48 h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-sm">QR Code tidak tersedia</p>
                </div>
              </div>
            )}
            <Button
              onClick={downloadQR}
              disabled={!qrPreview || isQrLoading}
              className="w-full"
            >
              {isQrLoading ? 'Generating...' : qrPreview ? 'Download QR Code' : 'QR Tidak Tersedia'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Aset</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus aset "{selectedAsset?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteAsset}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

