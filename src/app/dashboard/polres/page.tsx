"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Plus, Building, Edit, Trash2, Eye, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"

interface Polres {
  id: string
  name: string
  address?: string
  phone?: string
  poldaId: string
  polda: {
    name: string
  }
  createdAt: string
  updatedAt: string
  _count: {
    users: number
    assets: number
  }
}

interface Polda {
  id: string
  name: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function PolresPage() {
  const router = useRouter()
  const [polres, setPolres] = useState<Polres[]>([])
  const [poldas, setPoldas] = useState<Polda[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPolres, setSelectedPolres] = useState<Polres | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'delete' | null
    polresId: string | null
    polresName: string | null
  }>({
    isOpen: false,
    type: null,
    polresId: null,
    polresName: null
  })
  
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  // Pagination settings
  const [pageSize, setPageSize] = useState(10)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    poldaId: ""
  })
  
  const { toast } = useToast()
  const { session, isAdmin, isKorlantas, isPolda, isPolres, isUser } = useAuth()

  useEffect(() => {
    fetchPolres()
    fetchPoldas()
  }, [pagination.page, pageSize, searchTerm])

  const fetchPolres = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/polres?${params}`)
      const data = await response.json()
      
      if (data.polres) {
        setPolres(data.polres)
        setPagination(data.pagination)
      } else {
        setPolres(data)
        setPagination({
          page: 1,
          limit: pageSize,
          total: data.length,
          totalPages: Math.ceil(data.length / pageSize),
          hasNext: false,
          hasPrev: false
        })
      }
    } catch (error) {
      console.error('Error fetching polres:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data Polres",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPoldas = async () => {
    try {
      const response = await fetch('/api/polda/simple')
      const data = await response.json()
      setPoldas(data)
    } catch (error) {
      console.error('Error fetching poldas:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/polres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setFormData({ name: "", address: "", phone: "", poldaId: "" })
        fetchPolres()
        
        toast({
          variant: "success",
          title: "Berhasil!",
          description: "Polres baru berhasil ditambahkan",
        })
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Gagal menambahkan Polres",
        })
      }
    } catch (error) {
      console.error('Error creating polres:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat menambah Polres",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openConfirmDialog = (type: 'delete', polresId: string, polresName: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      polresId,
      polresName
    })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      polresId: null,
      polresName: null
    })
  }

  const handleConfirmAction = async () => {
    if (!confirmDialog.polresId || !confirmDialog.type) return

    if (confirmDialog.type === 'delete') {
      await handleDelete(confirmDialog.polresId)
    }

    closeConfirmDialog()
  }

  const handleDelete = async (polresId: string) => {
    try {
      const response = await fetch(`/api/polres/${polresId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchPolres()
        toast({
          variant: "success",
          title: "Berhasil!",
          description: "Polres berhasil dihapus",
        })
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error || "Gagal menghapus Polres",
        })
      }
    } catch (error) {
      console.error('Error deleting polres:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus Polres",
      })
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleViewDetail = (polresId: string) => {
    router.push(`/dashboard/polres/${polresId}`)
  }

  const handleEdit = async (polresId: string) => {
    try {
      const response = await fetch(`/api/polres/${polresId}`)
      if (response.ok) {
        const polres = await response.json()
        setSelectedPolres(polres)
        setFormData({ 
          name: polres.name, 
          address: polres.address || "", 
          phone: polres.phone || "", 
          poldaId: polres.poldaId 
        })
        setIsEditModalOpen(true)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data Polres",
        })
      }
    } catch (error) {
      console.error('Error fetching polres for edit:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data Polres",
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPolres) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/polres/${selectedPolres.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setFormData({ name: "", address: "", phone: "", poldaId: "" })
        setSelectedPolres(null)
        fetchPolres()
        
        toast({
          variant: "success",
          title: "Berhasil!",
          description: "Polres berhasil diperbarui",
        })
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Gagal memperbarui Polres",
        })
      }
    } catch (error) {
      console.error('Error updating polres:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui Polres",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data Polres...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Polres</h1>
          <p className="text-muted-foreground">
            Kelola data Kepolisian Resor
            {isPolda && session?.user?.poldaId && (
              <span className="ml-2 text-sm text-blue-600">
                (Menampilkan Polres untuk Polda Anda)
              </span>
            )}
            {isPolres && session?.user?.polresId && (
              <span className="ml-2 text-sm text-blue-600">
                (Menampilkan Polres Anda)
              </span>
            )}
            {isUser && session?.user?.polresId && (
              <span className="ml-2 text-sm text-blue-600">
                (Menampilkan Polres Anda)
              </span>
            )}
          </p>
        </div>
        
        {/* Only show Add button for ADMIN and KORLANTAS */}
        {(isAdmin || isKorlantas) && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Polres
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Tambah Polres Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Polres *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama Polres"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="polda">Polda *</Label>
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
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Masukkan alamat Polres"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Masukkan nomor telepon"
                  />
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
        )}
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Cari nama, alamat, atau nomor telepon..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Total Data</Label>
              <div className="text-2xl font-bold text-blue-600">
                {pagination.total}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pageSize">Data per Halaman</Label>
              <select 
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value))
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 data</option>
                <option value={10}>10 data</option>
                <option value={20}>20 data</option>
                <option value={50}>50 data</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Polres</TableHead>
                <TableHead>Polda</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Jumlah User</TableHead>
                <TableHead>Jumlah Aset</TableHead>
                <TableHead className="w-[150px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {polres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Tidak ada data Polres
                  </TableCell>
                </TableRow>
              ) : (
                polres.map((polresItem) => (
                  <TableRow key={polresItem.id}>
                    <TableCell className="font-medium">{polresItem.name}</TableCell>
                    <TableCell>{polresItem.polda.name}</TableCell>
                    <TableCell>
                      {polresItem.address ? (
                        polresItem.address.length > 25 ? `${polresItem.address.substring(0, 25)}...` : polresItem.address
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{polresItem.phone || <span className="text-gray-400">-</span>}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{polresItem._count.users} User</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{polresItem._count.assets} Aset</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                          onClick={() => handleViewDetail(polresItem.id)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Detail
                        </Button>
                        
                        {/* Only show Edit button for ADMIN, KORLANTAS, and POLDA */}
                        {(isAdmin || isKorlantas || isPolda) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100 transition-all duration-200 hover:scale-105"
                            onClick={() => handleEdit(polresItem.id)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        )}
                        
                        {/* Only show Delete button for ADMIN and KORLANTAS */}
                        {(isAdmin || isKorlantas) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100 transition-all duration-200 hover:scale-105"
                            onClick={() => openConfirmDialog('delete', polresItem.id, polresItem.name)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Hapus
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={!pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {(() => {
                    const pages = []
                    const totalPages = pagination.totalPages
                    const currentPage = pagination.page
                    
                    // Always show first page
                    pages.push(1)
                    
                    if (totalPages <= 7) {
                      // If total pages <= 7, show all pages
                      for (let i = 2; i <= totalPages; i++) {
                        pages.push(i)
                      }
                    } else {
                      // Show ellipsis and smart pagination
                      if (currentPage > 3) {
                        pages.push('...')
                      }
                      
                      const start = Math.max(2, currentPage - 1)
                      const end = Math.min(totalPages - 1, currentPage + 1)
                      
                      for (let i = start; i <= end; i++) {
                        if (!pages.includes(i)) {
                          pages.push(i)
                        }
                      }
                      
                      if (currentPage < totalPages - 2) {
                        pages.push('...')
                      }
                      
                      if (totalPages > 1) {
                        pages.push(totalPages)
                      }
                    }
                    
                    return pages.map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(page as number)}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))
                  })()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center mt-4 text-sm text-gray-500">
                Menampilkan {((pagination.page - 1) * pageSize) + 1} - {Math.min(pagination.page * pageSize, pagination.total)} dari {pagination.total} data
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={closeConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Polres</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus Polres "{confirmDialog.polresName}"?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>
              Batal
            </Button>
            <Button 
              onClick={handleConfirmAction}
              variant="destructive"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Polres</DialogTitle>
          </DialogHeader>
          {selectedPolres && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Nama Polres</Label>
                  <p className="text-gray-700">{selectedPolres.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Polda</Label>
                  <p className="text-gray-700">{selectedPolres.polda.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Alamat</Label>
                <p className="text-gray-700">{selectedPolres.address || '-'}</p>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Nomor Telepon</Label>
                <p className="text-gray-700">{selectedPolres.phone || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Jumlah User</Label>
                  <Badge variant="secondary">{selectedPolres._count.users} User</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Jumlah Aset</Label>
                  <Badge variant="outline">{selectedPolres._count.assets} Aset</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Tanggal Dibuat</Label>
                  <p className="text-gray-700">{new Date(selectedPolres.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Terakhir Update</Label>
                  <p className="text-gray-700">{new Date(selectedPolres.updatedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">ID Polres</Label>
                <p className="text-gray-700 text-sm font-mono">{selectedPolres.id}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Polres</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Polres *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama Polres"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-polda">Polda *</Label>
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
              <Label htmlFor="edit-address">Alamat</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat Polres"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Nomor Telepon</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Masukkan nomor telepon"
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
    </div>
  )
}
