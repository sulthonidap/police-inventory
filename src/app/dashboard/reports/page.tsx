"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogOverlay } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Edit, Trash2, Eye, Download, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface Report {
  id: string
  title: string
  type: string
  customType?: string
  status: string
  description: string
  content?: string
  user: {
    name: string
    nrp: string
  }
  polda: {
    id: string
    name: string
  } | null
  polres: {
    id: string
    name: string
  } | null
  createdAt: string
  updatedAt: string
}

interface CustomReportType {
  id: string
  name: string
  description?: string
  isActive: boolean
}

interface Polres {
  id: string
  name: string
  poldaId?: string
  polda?: {
    name: string
  }
}

interface Polda {
  id: string
  name: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [polres, setPolres] = useState<Polres[]>([])
  const [polresForForm, setPolresForForm] = useState<Polres[]>([])
  const [poldas, setPoldas] = useState<Polda[]>([])
  const [customTypes, setCustomTypes] = useState<CustomReportType[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCustomTypeModalOpen, setIsCustomTypeModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    customType: "",
    description: "",
    poldaId: "",
    polresId: ""
  })

  // Custom type form data
  const [customTypeFormData, setCustomTypeFormData] = useState({
    name: "",
    description: ""
  })
  
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
    fetchPolres()
    fetchPoldas()
    fetchCustomTypes()
  }, [])

  // When poldaId changes, load Polres for form
  useEffect(() => {
    const loadPolresForForm = async () => {
      if (!formData.poldaId) {
        setPolresForForm([])
        setFormData(prev => ({ ...prev, polresId: "" }))
        return
      }
      const res = await fetch(`/api/polres/simple?poldaId=${formData.poldaId}`)
      const data = await res.json()
      setPolresForForm(data)
      // reset selected polres if not in list
      if (!data.find((p: Polres) => p.id === formData.polresId)) {
        setFormData(prev => ({ ...prev, polresId: "" }))
      }
    }
    loadPolresForForm()
  }, [formData.poldaId])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || data) // Handle both new and old response format
      } else {
        toast({ title: "Error", description: "Gagal memuat data laporan", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast({ title: "Error", description: "Gagal memuat data laporan", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchPolres = async () => {
    try {
      const response = await fetch('/api/polres/simple')
      if (response.ok) {
        const data = await response.json()
        setPolres(data)
      }
    } catch (error) {
      console.error('Error fetching polres:', error)
    }
  }

  const fetchPoldas = async () => {
    try {
      const response = await fetch('/api/polda/simple')
      if (response.ok) {
        const data = await response.json()
        setPoldas(data)
      }
    } catch (error) {
      console.error('Error fetching poldas:', error)
    }
  }

  const fetchCustomTypes = async () => {
    try {
      const response = await fetch('/api/reports/custom-types')
      if (response.ok) {
        const data = await response.json()
        setCustomTypes(data)
      }
    } catch (error) {
      console.error('Error fetching custom types:', error)
    }
  }

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({ title: "Sukses", description: "Laporan berhasil dibuat" })
        setIsCreateModalOpen(false)
        resetForm()
        fetchReports()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Gagal membuat laporan", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan saat membuat laporan", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReport) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({ title: "Sukses", description: "Laporan berhasil diperbarui" })
        setIsEditModalOpen(false)
        resetForm()
        fetchReports()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Gagal memperbarui laporan", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan saat memperbarui laporan", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedReport) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({ title: "Sukses", description: "Laporan berhasil dihapus" })
        setIsDeleteModalOpen(false)
        setSelectedReport(null)
        fetchReports()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Gagal menghapus laporan", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan saat menghapus laporan", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = async (reportId: string, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/${reportId}/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan-${reportId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({ title: "Sukses", description: `Laporan berhasil diexport ke ${format.toUpperCase()}` })
      } else {
        toast({ title: "Error", description: "Gagal mengexport laporan", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan saat mengexport laporan", variant: "destructive" })
    }
  }

  const handleCreateCustomType = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/reports/custom-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customTypeFormData)
      })
      
      if (response.ok) {
        toast({ title: "Sukses", description: "Tipe laporan kustom berhasil dibuat" })
        setIsCustomTypeModalOpen(false)
        setCustomTypeFormData({ name: "", description: "" })
        fetchCustomTypes()
      } else {
        const error = await response.json()
        toast({ title: "Error", description: error.error || "Gagal membuat tipe laporan kustom", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Terjadi kesalahan saat membuat tipe laporan kustom", variant: "destructive" })
    }
  }

  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  const openEditModal = async (report: Report) => {
    setSelectedReport(report)
    const newFormData = {
      title: report.title,
      type: report.type,
      customType: report.customType || "",
      description: report.description,
      poldaId: report.polda?.id || "",
      polresId: report.polres?.id || ""
    }
    setFormData(newFormData)
    
    // Load Polres for the selected Polda
    if (newFormData.poldaId) {
      const res = await fetch(`/api/polres/simple?poldaId=${newFormData.poldaId}`)
      const data = await res.json()
      setPolresForForm(data)
    } else {
      setPolresForForm([])
    }
    
    setIsEditModalOpen(true)
  }

  const openViewModal = (report: Report) => {
    setSelectedReport(report)
    setIsViewModalOpen(true)
  }

  const openDeleteModal = (report: Report) => {
    setSelectedReport(report)
    setIsDeleteModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      customType: "",
      description: "",
      poldaId: "",
      polresId: ""
    })
    setPolresForForm([])
    setSelectedReport(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'SUBMITTED':
        return <Badge className="bg-blue-100 text-blue-800">Dikirim</Badge>
      case 'REVIEWED':
        return <Badge className="bg-yellow-100 text-yellow-800">Direview</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string, customType?: string) => {
    const typeColors = {
      'UMUM': 'bg-blue-100 text-blue-800',
      'INTERNAL': 'bg-green-100 text-green-800',
      'CUSTOM': 'bg-purple-100 text-purple-800'
    }
    
    const displayType = type === 'CUSTOM' && customType ? customType : type
    return <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>{displayType}</Badge>
  }

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === "" || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesType = typeFilter === "all" || report.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReports = filteredReports.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, typeFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data laporan...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Manajemen Laporan</h1>
          <p className="text-muted-foreground">Kelola data laporan dan dokumen</p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Buat Laporan
            </Button>
          </DialogTrigger>
          <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Laporan Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Laporan *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul laporan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Laporan *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value, customType: "" })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Pilih tipe laporan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UMUM">Umum</SelectItem>
                        <SelectItem value="INTERNAL">Internal</SelectItem>
                        <SelectItem value="CUSTOM">Kustom</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.type === "CUSTOM" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCustomTypeModalOpen(true)}
                        className="whitespace-nowrap"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Tambah Tipe
                      </Button>
                    )}
                  </div>
                  {formData.type === "CUSTOM" && (
                    <Select 
                      value={formData.customType} 
                      onValueChange={(value) => setFormData({ ...formData, customType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe kustom" />
                      </SelectTrigger>
                      <SelectContent>
                        {customTypes.map((customType) => (
                          <SelectItem key={customType.id} value={customType.name}>
                            {customType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="polda">Polda</Label>
                  <Select value={formData.poldaId} onValueChange={(value) => setFormData({ ...formData, poldaId: value, polresId: "" })}>
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
                       <SelectValue placeholder={formData.poldaId ? "Pilih Polres" : "Pilih Polda dulu"} />
                     </SelectTrigger>
                     <SelectContent>
                       {polresForForm.map((polres) => (
                         <SelectItem key={polres.id} value={polres.id}>
                           {polres.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan deskripsi laporan"
                  rows={4}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
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
                  placeholder="Cari judul laporan..."
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
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Dikirim</SelectItem>
                  <SelectItem value="REVIEWED">Direview</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipe</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="UMUM">Umum</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="CUSTOM">Kustom</SelectItem>
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
                  setTypeFilter("all")
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
        {currentReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              Tidak ada data laporan
            </CardContent>
          </Card>
        ) : (
          currentReports.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getTypeBadge(report.type, report.customType)}
                    {getStatusBadge(report.status)}
                  </div>
                </div>
                
                                  <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Polda:</span> {report.polda?.name || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Polres:</span> {report.polres?.name || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Dibuat oleh:</span> {report.user?.name || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Tanggal:</span> {new Date(report.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                
                <div className="flex flex-wrap gap-1 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100"
                    onClick={() => openViewModal(report)}
                    title="Lihat"
                  >
                    <Eye className="mr-1 h-3 w-3 text-white" />Lihat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100"
                    onClick={() => openEditModal(report)}
                    title="Edit"
                  >
                    <Edit className="mr-1 h-3 w-3 text-white" />Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-purple-600 border-purple-200 text-white hover:bg-purple-100"
                    onClick={() => handleExport(report.id, 'pdf')}
                    title="Export PDF"
                  >
                    <FileText className="mr-1 h-3 w-3 text-white" />PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100"
                    onClick={() => openDeleteModal(report)}
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
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Polda</TableHead>
                  <TableHead>Polres</TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-[200px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Tidak ada data laporan
                    </TableCell>
                  </TableRow>
                ) : (
                  currentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{getTypeBadge(report.type, report.customType)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.polda?.name || '-'}</TableCell>
                      <TableCell>{report.polres?.name || '-'}</TableCell>
                      <TableCell>{report.user?.name || '-'}</TableCell>
                      <TableCell>{new Date(report.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100"
                            onClick={() => openViewModal(report)}
                            title="Lihat"
                          >
                            <Eye className="mr-1 h-3 w-3 text-white" />Lihat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100"
                            onClick={() => openEditModal(report)}
                            title="Edit"
                          >
                            <Edit className="mr-1 h-3 w-3 text-white" />Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-purple-600 border-purple-200 text-white hover:bg-purple-100"
                            onClick={() => handleExport(report.id, 'pdf')}
                            title="Export PDF"
                          >
                            <FileText className="mr-1 h-3 w-3 text-white" />PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100"
                            onClick={() => openDeleteModal(report)}
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
                Menampilkan {startIndex + 1} - {endIndex} dari {filteredReports.length} data
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Edit Report Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Laporan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditReport} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Judul Laporan *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul laporan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipe Laporan *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value, customType: "" })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Pilih tipe laporan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UMUM">Umum</SelectItem>
                      <SelectItem value="INTERNAL">Internal</SelectItem>
                      <SelectItem value="CUSTOM">Kustom</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.type === "CUSTOM" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCustomTypeModalOpen(true)}
                      className="whitespace-nowrap"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Tambah Tipe
                    </Button>
                  )}
                </div>
                {formData.type === "CUSTOM" && (
                  <Select 
                    value={formData.customType} 
                    onValueChange={(value) => setFormData({ ...formData, customType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe kustom" />
                    </SelectTrigger>
                    <SelectContent>
                      {customTypes.map((customType) => (
                        <SelectItem key={customType.id} value={customType.name}>
                          {customType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-polda">Polda</Label>
                <Select value={formData.poldaId} onValueChange={(value) => setFormData({ ...formData, poldaId: value, polresId: "" })}>
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
                     <SelectValue placeholder={formData.poldaId ? "Pilih Polres" : "Pilih Polda dulu"} />
                   </SelectTrigger>
                   <SelectContent>
                     {polresForForm.map((polres) => (
                       <SelectItem key={polres.id} value={polres.id}>
                         {polres.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi laporan"
                rows={4}
                required
              />
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

      {/* View Report Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Judul</Label>
                <p className="text-sm text-gray-600">{selectedReport?.title}</p>
              </div>
              <div>
                <Label className="font-medium">Tipe</Label>
                <div className="mt-1">{selectedReport && getTypeBadge(selectedReport.type, selectedReport.customType)}</div>
              </div>
            </div>

            <div>
              <Label className="font-medium">Status</Label>
              <div className="mt-1">{selectedReport && getStatusBadge(selectedReport.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Polda</Label>
                <p className="text-sm text-gray-600">{selectedReport?.polda?.name || '-'}</p>
              </div>
              <div>
                <Label className="font-medium">Polres</Label>
                <p className="text-sm text-gray-600">{selectedReport?.polres?.name || '-'}</p>
              </div>
            </div>

            <div>
              <Label className="font-medium">Deskripsi</Label>
              <p className="text-sm text-gray-600 mt-1">{selectedReport?.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Dibuat Oleh</Label>
                <p className="text-sm text-gray-600">{selectedReport?.user?.name || '-'}</p>
              </div>
              <div>
                <Label className="font-medium">Tanggal Dibuat</Label>
                <p className="text-sm text-gray-600">
                  {selectedReport ? new Date(selectedReport.createdAt).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Laporan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus laporan "{selectedReport?.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Type Modal */}
      <Dialog open={isCustomTypeModalOpen} onOpenChange={setIsCustomTypeModalOpen}>
        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Tipe Laporan Kustom</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCustomType} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customTypeName">Nama Tipe *</Label>
              <Input
                id="customTypeName"
                value={customTypeFormData.name}
                onChange={(e) => setCustomTypeFormData({ ...customTypeFormData, name: e.target.value })}
                placeholder="Masukkan nama tipe laporan"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customTypeDescription">Deskripsi</Label>
              <Textarea
                id="customTypeDescription"
                value={customTypeFormData.description}
                onChange={(e) => setCustomTypeFormData({ ...customTypeFormData, description: e.target.value })}
                placeholder="Masukkan deskripsi tipe laporan (opsional)"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCustomTypeModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
