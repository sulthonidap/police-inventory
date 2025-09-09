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
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Plus, Edit, Trash2, Eye, Calendar, Image, FileText, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface Harwat {
  id: string
  title: string
  dateTime: Date | string
  description: string
  photos: string | null // JSON string of photo paths
  createdAt: Date | string
  updatedAt: Date | string
}

export default function HarwatPage() {
  const [harwat, setHarwat] = useState<Harwat[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [selectedHarwat, setSelectedHarwat] = useState<Harwat | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [formData, setFormData] = useState({
    title: "",
    dateTime: "",
    description: "",
    photos: [] as File[]
  })
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchHarwat()
  }, [])

  const generatePhotoPreviews = (files: File[]) => {
    const previews: string[] = []
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          previews.push(e.target.result as string)
          if (previews.length === files.length) {
            setPhotoPreviews(previews)
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length !== fileArray.length) {
      toast({
        title: "Peringatan",
        description: "Beberapa file bukan gambar dan akan diabaikan",
        variant: "destructive"
      })
    }
    
    if (imageFiles.length > 0) {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...imageFiles] }))
      generatePhotoPreviews(imageFiles)
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const fetchHarwat = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/harwat')
      if (response.ok) {
        const data = await response.json()
        setHarwat(data)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data Harwat",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching harwat:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('dateTime', formData.dateTime)
      formDataToSend.append('description', formData.description)
      
      // Append multiple photos
      formData.photos.forEach((photo) => {
        formDataToSend.append('photos', photo)
      })

      const response = await fetch('/api/harwat', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Data Harwat berhasil ditambahkan"
        })
        setIsModalOpen(false)
        setFormData({ title: "", dateTime: "", description: "", photos: [] })
        setPhotoPreviews([])
        fetchHarwat()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal menambahkan data Harwat",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating harwat:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan data",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHarwat) return

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('dateTime', formData.dateTime)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('keepExistingPhotos', 'true') // Keep existing photos by default
      
      // Append new photos
      formData.photos.forEach((photo) => {
        formDataToSend.append('photos', photo)
      })

      const response = await fetch(`/api/harwat/${selectedHarwat.id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Data Harwat berhasil diperbarui"
        })
        setIsEditModalOpen(false)
        setSelectedHarwat(null)
        setFormData({ title: "", dateTime: "", description: "", photos: [] })
        setPhotoPreviews([])
        fetchHarwat()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal memperbarui data Harwat",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating harwat:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui data",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedHarwat) return

    try {
      const response = await fetch(`/api/harwat/${selectedHarwat.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Data Harwat berhasil dihapus"
        })
        setIsDeleteDialogOpen(false)
        setSelectedHarwat(null)
        fetchHarwat()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal menghapus data Harwat",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting harwat:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus data",
        variant: "destructive"
      })
    }
  }

  const openEditModal = (harwat: Harwat) => {
    setSelectedHarwat(harwat)
    setFormData({
      title: harwat.title,
      dateTime: new Date(harwat.dateTime).toISOString().slice(0, 16),
      description: harwat.description,
      photos: []
    })
    setPhotoPreviews([])
    setIsEditModalOpen(true)
  }

  const openDeleteDialog = (harwat: Harwat) => {
    setSelectedHarwat(harwat)
    setIsDeleteDialogOpen(true)
  }

  const openPhotoModal = (harwat: Harwat) => {
    setSelectedHarwat(harwat)
    setIsPhotoModalOpen(true)
  }

  // Filter dan pagination
  const filteredHarwat = harwat.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredHarwat.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHarwat = filteredHarwat.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div className="text-lg">Memuat data Harwat...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Manajemen Harwat</h1>
          <p className="text-muted-foreground">Kelola data Harwat dan dokumentasi</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Harwat
            </Button>
          </DialogTrigger>
          <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-[600px] max-h-[98vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Data Harwat</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul Harwat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTime">Kapan/Waktu</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Keterangan</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masukkan keterangan"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Foto (bisa pilih multiple)</Label>
                
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="photo" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                        Klik untuk memilih foto
                      </label>
                      {' '}atau drag & drop foto di sini
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF hingga 10MB per file
                    </p>
                  </div>
                  
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>

                {/* Selected Photos Count */}
                {formData.photos.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {formData.photos.length} foto dipilih
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, photos: [] }))
                        setPhotoPreviews([])
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Hapus Semua
                    </Button>
                  </div>
                )}

                {/* Photo Previews */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {formData.photos[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan judul atau keterangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Harwat ({filteredHarwat.length} item)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedHarwat.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data Harwat"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kapan/Waktu</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHarwat.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(item.dateTime).toLocaleString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>
                        {item.photos ? (
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4 text-green-500" />
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => openPhotoModal(item)}
                              className="text-green-600 hover:text-green-700 p-0 h-auto"
                            >
                              {JSON.parse(item.photos).length} foto
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Tidak ada</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(item)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[98vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Harwat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Judul</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Masukkan judul Harwat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dateTime">Kapan/Waktu</Label>
              <Input
                id="edit-dateTime"
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Keterangan</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan keterangan"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Foto tambahan (opsional)</Label>
              
              {/* Current Photos Info */}
              {selectedHarwat?.photos && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Foto saat ini: {JSON.parse(selectedHarwat.photos).length} foto
                </div>
              )}
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <label htmlFor="edit-photo" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                      Klik untuk menambah foto
                    </label>
                    {' '}atau drag & drop foto di sini
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hingga 10MB per file
                  </p>
                </div>
                
                <Input
                  id="edit-photo"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>

              {/* Selected Photos Count */}
              {formData.photos.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {formData.photos.length} foto baru dipilih
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, photo: [] }))
                      setPhotoPreviews([])
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Hapus Semua
                  </Button>
                </div>
              )}

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {formData.photos[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Perbarui
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Apakah Anda yakin ingin menghapus data Harwat <strong>"{selectedHarwat?.title}"</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Modal */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Foto - {selectedHarwat?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedHarwat?.photos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {JSON.parse(selectedHarwat.photos).map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Foto {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada foto</h3>
                <p className="mt-1 text-sm text-gray-500">Data ini belum memiliki foto</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhotoModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
