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
import { MoreHorizontal, Plus, Building2, Edit, Trash2, Eye, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"

interface Polda {
  id: string
  name: string
  address?: string
  phone?: string
  createdAt: string
  updatedAt: string
  _count: {
    polres: number
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function PoldaPage() {
  const router = useRouter()
  const [poldas, setPoldas] = useState<Polda[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPolda, setSelectedPolda] = useState<Polda | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'delete' | null
    poldaId: string | null
    poldaName: string | null
  }>({
    isOpen: false,
    type: null,
    poldaId: null,
    poldaName: null
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
    phone: ""
  })
  
  const { toast } = useToast()

  useEffect(() => {
    fetchPoldas()
  }, [pagination.page, pageSize, searchTerm])

  const fetchPoldas = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/polda?${params}`)
      const data = await response.json()
      
      if (data.poldas) {
        setPoldas(data.poldas)
        setPagination(data.pagination)
      } else {
        setPoldas(data)
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
      console.error('Error fetching poldas:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data Polda",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/polda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setFormData({ name: "", address: "", phone: "" })
        fetchPoldas()
        
        toast({
          variant: "success",
          title: "Berhasil!",
          description: "Polda baru berhasil ditambahkan",
        })
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Gagal menambahkan Polda",
        })
      }
    } catch (error) {
      console.error('Error creating polda:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat menambah Polda",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openConfirmDialog = (type: 'delete', poldaId: string, poldaName: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      poldaId,
      poldaName
    })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      poldaId: null,
      poldaName: null
    })
  }

  const handleConfirmAction = async () => {
    if (!confirmDialog.poldaId || !confirmDialog.type) return

    if (confirmDialog.type === 'delete') {
      await handleDelete(confirmDialog.poldaId)
    }

    closeConfirmDialog()
  }

  const handleDelete = async (poldaId: string) => {
    try {
      console.log('Deleting polda:', poldaId)
      const response = await fetch(`/api/polda/${poldaId}`, {
        method: 'DELETE'
      })
      console.log('Response status:', response.status)
      
      if (response.ok) {
        fetchPoldas()
        toast({
          variant: "success",
          title: "Berhasil!",
          description: "Polda berhasil dihapus",
        })
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.error || "Gagal menghapus Polda",
        })
      }
    } catch (error) {
      console.error('Error deleting polda:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus Polda",
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

  const handleViewDetail = (poldaId: string) => {
    router.push(`/dashboard/polda/${poldaId}`)
  }

  const handleEdit = async (poldaId: string, currentName: string) => {
    try {
      const response = await fetch(`/api/polda/${poldaId}`)
      if (response.ok) {
        const polda = await response.json()
        setSelectedPolda(polda)
        setFormData({ name: polda.name, address: polda.address || "", phone: polda.phone || "" })
        setIsEditModalOpen(true)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data Polda",
        })
      }
    } catch (error) {
      console.error('Error fetching polda for edit:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data Polda",
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPolda) return
    
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/polda/${selectedPolda.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setFormData({ name: "", address: "", phone: "" })
        setSelectedPolda(null)
        fetchPoldas()
        
        toast({
          variant: "success",
          title: "Berhasil!",
          description: "Polda berhasil diperbarui",
        })
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Gagal memperbarui Polda",
        })
      }
    } catch (error) {
      console.error('Error updating polda:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui Polda",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data Polda...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Polda</h1>
          <p className="text-muted-foreground">Kelola data Kepolisian Daerah</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Polda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Polda Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Polda</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama Polda"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Masukkan alamat Polda"
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
                <TableHead>Nama Polda</TableHead>
                <TableHead>Jumlah Polres</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Nomor Telepon</TableHead>
                <TableHead className="w-[150px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poldas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Tidak ada data Polda
                  </TableCell>
                </TableRow>
              ) : (
                poldas.map((polda) => (
                  <TableRow key={polda.id}>
                    <TableCell className="font-medium">{polda.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{polda._count.polres} Polres</Badge>
                    </TableCell>
                    <TableCell>
                      {polda.address ? (
                        polda.address.length > 30 ? `${polda.address.substring(0, 30)}...` : polda.address
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {polda.phone || <span className="text-gray-400">-</span>}
                    </TableCell>
                                         <TableCell>
                       <div className="flex gap-1">
                         <Button
                           size="sm"
                           variant="outline"
                           className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100 transition-all duration-200 hover:scale-105"
                           onClick={() => handleViewDetail(polda.id)}
                         >
                           <Eye className="mr-1 h-3 w-3" />
                           Detail
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100 transition-all duration-200 hover:scale-105"
                           onClick={() => handleEdit(polda.id, polda.name)}
                         >
                           <Edit className="mr-1 h-3 w-3" />
                           Edit
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100 transition-all duration-200 hover:scale-105"
                           onClick={() => openConfirmDialog('delete', polda.id, polda.name)}
                         >
                           <Trash2 className="mr-1 h-3 w-3" />
                           Hapus
                         </Button>
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
             <DialogTitle>Hapus Polda</DialogTitle>
           </DialogHeader>
           <div className="py-4">
             <p className="text-gray-600">
               Apakah Anda yakin ingin menghapus Polda "{confirmDialog.poldaName}"?
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
             <DialogTitle>Detail Polda</DialogTitle>
           </DialogHeader>
           {selectedPolda && (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="font-semibold">Nama Polda</Label>
                   <p className="text-gray-700">{selectedPolda.name}</p>
                 </div>
                 <div className="space-y-2">
                   <Label className="font-semibold">Jumlah Polres</Label>
                   <Badge variant="secondary">{selectedPolda._count.polres} Polres</Badge>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="font-semibold">Alamat</Label>
                   <p className="text-gray-700">{selectedPolda.address || '-'}</p>
                 </div>
                 <div className="space-y-2">
                   <Label className="font-semibold">Nomor Telepon</Label>
                   <p className="text-gray-700">{selectedPolda.phone || '-'}</p>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="font-semibold">Tanggal Dibuat</Label>
                   <p className="text-gray-700">{new Date(selectedPolda.createdAt).toLocaleDateString('id-ID', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                   })}</p>
                 </div>
                 <div className="space-y-2">
                   <Label className="font-semibold">Terakhir Update</Label>
                   <p className="text-gray-700">{new Date(selectedPolda.updatedAt).toLocaleDateString('id-ID', {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                   })}</p>
                 </div>
               </div>
               <div className="space-y-2">
                 <Label className="font-semibold">ID Polda</Label>
                 <p className="text-gray-700 text-sm font-mono">{selectedPolda.id}</p>
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
         <DialogContent className="sm:max-w-[425px]">
           <DialogHeader>
             <DialogTitle>Edit Polda</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleUpdate} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="edit-name">Nama Polda</Label>
               <Input
                 id="edit-name"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 placeholder="Masukkan nama Polda"
                 required
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="edit-address">Alamat</Label>
               <Input
                 id="edit-address"
                 value={formData.address}
                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                 placeholder="Masukkan alamat Polda"
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
