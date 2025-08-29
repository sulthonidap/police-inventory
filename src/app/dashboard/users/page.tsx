"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Plus, UserPlus, CheckCircle, XCircle, Trash2, Loader2, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"

interface User {
  id: string
  nrp: string
  name: string
  email: string
  role: string
  status: string
  polres: {
    id: string
    name: string
    polda: {
      name: string
    }
  } | null
  createdAt: string
}

interface Polres {
  id: string
  name: string
  polda: {
    name: string
  }
}

interface PoldaOption { id: string; name: string }

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [polres, setPolres] = useState<Polres[]>([])
  const [poldas, setPoldas] = useState<PoldaOption[]>([])
  const [polresForFilter, setPolresForFilter] = useState<Polres[]>([])
  const [polresForForm, setPolresForForm] = useState<Polres[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'approve' | 'reject' | 'delete' | 'reset' | null
    userId: string | null
    userName: string | null
  }>({
    isOpen: false,
    type: null,
    userId: null,
    userName: null
  })
  const [actionLoading, setActionLoading] = useState<{
    userId: string | null
    type: 'approve' | 'reject' | 'delete' | 'reset' | null
  }>({
    userId: null,
    type: null
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
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [poldaFilter, setPoldaFilter] = useState("ALL")
  const [polresFilter, setPolresFilter] = useState("ALL")

  const [formData, setFormData] = useState({
    nrp: "",
    name: "",
    email: "",
    password: "",
    role: "",
    poldaId: "",
    polresId: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchPoldas()
    fetchPolres()
  }, [pagination.page, pageSize, searchTerm, statusFilter, roleFilter, poldaFilter, polresFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'ALL' && { status: statusFilter }),
        ...(roleFilter && roleFilter !== 'ALL' && { role: roleFilter })
      })

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()

      // Normalisasi list users agar selalu berupa array
      const dataUsers = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data)
        ? data
        : []

      let filteredUsers: User[] = dataUsers

      // Filter berdasarkan Polda/Polres di frontend
      if (poldaFilter !== 'ALL') {
        filteredUsers = filteredUsers.filter((user: User) => user.polres?.polda.name === poldaFilter)
      }
      if (polresFilter !== 'ALL') {
        filteredUsers = filteredUsers.filter((user: User) => user.polres?.id === polresFilter)
      }

      if (data?.pagination) {
        setUsers(filteredUsers)
        setPagination({
          ...data.pagination,
          total: filteredUsers.length,
          totalPages: Math.max(1, Math.ceil(filteredUsers.length / pageSize))
        })
      } else {
        setUsers(filteredUsers)
        setPagination({
          page: 1,
          limit: pageSize,
          total: filteredUsers.length,
          totalPages: Math.max(1, Math.ceil(filteredUsers.length / pageSize)),
          hasNext: false,
          hasPrev: false
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data pengguna",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPolres = async () => {
    try {
      const response = await fetch('/api/polres/simple')
      const data = await response.json()
      setPolres(data)
    } catch (error) {
      console.error('Error fetching polres:', error)
    }
  }

  const fetchPoldas = async () => {
    try {
      const res = await fetch('/api/polda/simple')
      const data = await res.json()
      setPoldas(data)
    } catch (e) {
      console.error('Error fetching poldas:', e)
    }
  }

  // When Polda filter changes, load Polres list for that Polda
  useEffect(() => {
    const loadPolresForFilter = async () => {
      if (poldaFilter === 'ALL') {
        setPolresForFilter([])
        setPolresFilter('ALL')
        return
      }
      const poldaObj = poldas.find(p => p.name === poldaFilter)
      if (!poldaObj) return
      const res = await fetch(`/api/polres/simple?poldaId=${poldaObj.id}`)
      const data = await res.json()
      setPolresForFilter(data)
      setPolresFilter('ALL')
    }
    loadPolresForFilter()
  }, [poldaFilter, poldas])

  // When form role or poldaId changes, load Polres for form
  useEffect(() => {
    const loadPolresForForm = async () => {
      if (formData.role === 'USER') {
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
      } else {
        setPolresForForm([])
      }
    }
    loadPolresForForm()
  }, [formData.role, formData.poldaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setFormData({
          nrp: "",
          name: "",
          email: "",
          password: "",
          role: "",
          poldaId: "",
          polresId: ""
        })
        fetchUsers()
        window.dispatchEvent(new CustomEvent('refreshPendingCount'))

        toast({
          variant: "success",
          title: "Berhasil!",
          description: "Pengguna baru berhasil ditambahkan",
        })
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Gagal menambahkan pengguna",
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat menambah pengguna",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (userId: string) => {
    setActionLoading({ userId, type: 'approve' })
    try {
      const response = await fetch(`/api/users/${userId}/approve`, { method: 'PATCH' })
      if (response.ok) {
        await response.json()
        fetchUsers()
        window.dispatchEvent(new CustomEvent('refreshPendingCount'))
        toast({ variant: "success", title: "Berhasil!", description: "Pengguna berhasil disetujui" })
      } else {
        const errorData = await response.json()
        toast({ variant: "destructive", title: "Error", description: errorData.error || "Gagal menyetujui pengguna" })
      }
    } catch (error) {
      console.error('Error approving user:', error)
      toast({ variant: "destructive", title: "Error", description: "Gagal menyetujui pengguna" })
    } finally {
      setActionLoading({ userId: null, type: null })
      closeConfirmDialog()
    }
  }

  const handleReject = async (userId: string) => {
    setActionLoading({ userId, type: 'reject' })
    try {
      const response = await fetch(`/api/users/${userId}/reject`, { method: 'PATCH' })
      if (response.ok) {
        await response.json()
        fetchUsers()
        window.dispatchEvent(new CustomEvent('refreshPendingCount'))
        toast({ variant: "warning", title: "Berhasil!", description: "Pengguna berhasil ditolak" })
      } else {
        const errorData = await response.json()
        toast({ variant: "destructive", title: "Error", description: errorData.error || "Gagal menolak pengguna" })
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast({ variant: "destructive", title: "Error", description: "Gagal menolak pengguna" })
    } finally {
      setActionLoading({ userId: null, type: null })
      closeConfirmDialog()
    }
  }

  const openConfirmDialog = (type: 'approve' | 'reject' | 'delete' | 'reset', userId: string, userName: string) => {
    setConfirmDialog({ isOpen: true, type, userId, userName })
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, type: null, userId: null, userName: null })
  }

  const handleConfirmAction = async () => {
    if (!confirmDialog.userId || !confirmDialog.type) return
    if (confirmDialog.type === 'approve') await handleApprove(confirmDialog.userId)
    else if (confirmDialog.type === 'reject') await handleReject(confirmDialog.userId)
    else if (confirmDialog.type === 'delete') await handleDelete(confirmDialog.userId)
    else if (confirmDialog.type === 'reset') await handleResetPassword(confirmDialog.userId)
  }

  const handleResetPassword = async (userId: string) => {
    setActionLoading({ userId, type: 'reset' })
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, { method: 'PATCH' })
      const data = await response.json()
      if (response.ok) {
        const pwd: string = data.password
        toast({
          variant: "success",
          title: "Password direset",
          description: (
            <div className="flex items-center gap-2">
              <span>Password baru:</span>
              <code className="px-1 py-0.5 bg-white/70 rounded text-gray-900">{pwd}</code>
              <Button
                type="button"
                onClick={() => navigator.clipboard.writeText(pwd)}
                className="h-7 px-2 text-xs"
              >
                Copy
              </Button>
            </div>
          )
        })
      } else {
        toast({ variant: "destructive", title: "Error", description: data.error || "Gagal reset password" })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Gagal reset password" })
    } finally {
      setActionLoading({ userId: null, type: null })
      closeConfirmDialog()
    }
  }

  const handleDelete = async (userId: string) => {
    setActionLoading({ userId, type: 'delete' })
    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (response.ok) {
        fetchUsers()
        toast({ variant: "success", title: "Berhasil!", description: "Pengguna berhasil dihapus" })
      } else {
        const errorData = await response.json()
        toast({ variant: "destructive", title: "Error", description: errorData.error || "Gagal menghapus pengguna" })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus pengguna" })
    } finally {
      setActionLoading({ userId: null, type: null })
      closeConfirmDialog()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu Approval</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-purple-100 text-purple-800',
      'KORLANTAS': 'bg-blue-100 text-blue-800',
      'POLDA': 'bg-indigo-100 text-indigo-800',
      'POLRES': 'bg-cyan-100 text-cyan-800',
      'USER': 'bg-gray-100 text-gray-800'
    }
    return <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>
  }

  const handlePageChange = (page: number) => { setPagination(prev => ({ ...prev, page })) }
  const handleSearch = (value: string) => { setSearchTerm(value); setPagination(prev => ({ ...prev, page: 1 })) }
  const handleStatusFilter = (value: string) => { setStatusFilter(value); setPagination(prev => ({ ...prev, page: 1 })) }
  const handleRoleFilter = (value: string) => { setRoleFilter(value); setPagination(prev => ({ ...prev, page: 1 })) }
  const handlePoldaFilter = (value: string) => { setPoldaFilter(value); setPagination(prev => ({ ...prev, page: 1 })) }
  const handlePolresFilter = (value: string) => { setPolresFilter(value); setPagination(prev => ({ ...prev, page: 1 })) }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data pengguna...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">Kelola data pengguna sistem</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nrp">NRP</Label>
                  <Input id="nrp" value={formData.nrp} onChange={(e) => setFormData({ ...formData, nrp: e.target.value })} placeholder="Masukkan NRP" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Masukkan nama" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Masukkan email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Masukkan password" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value, // reset dependent fields
                    poldaId: value === 'POLDA' || value === 'USER' ? formData.poldaId : '',
                    polresId: value === 'POLRES' || value === 'USER' ? formData.polresId : ''
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="POLRES">Polres</SelectItem>
                      <SelectItem value="POLDA">Polda</SelectItem>
                      <SelectItem value="KORLANTAS">Korlantas</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role POLDA: pilih Polda */}
                {formData.role === 'POLDA' && (
                  <div className="space-y-2">
                    <Label htmlFor="polda">Polda</Label>
                    <Select value={formData.poldaId} onValueChange={(value) => setFormData({ ...formData, poldaId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Polda" />
                      </SelectTrigger>
                      <SelectContent>
                        {poldas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Role USER: pilih Polda -> Polres terafiliasi */}
              {formData.role === 'USER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="polda">Polda</Label>
                    <Select value={formData.poldaId} onValueChange={(value) => setFormData({ ...formData, poldaId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Polda" />
                      </SelectTrigger>
                      <SelectContent>
                        {poldas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="polres">Polres</Label>
                    <Select value={formData.polresId} onValueChange={(value) => setFormData({ ...formData, polresId: value })} disabled={!formData.poldaId}>
                      <SelectTrigger>
                        <SelectValue placeholder={formData.poldaId ? "Pilih Polres" : "Pilih Polda dulu"} />
                      </SelectTrigger>
                      <SelectContent>
                        {polresForForm.map((pr) => (
                          <SelectItem key={pr.id} value={pr.id}>{pr.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Role POLRES: pilih Polres */}
              {formData.role === 'POLRES' && (
                <div className="space-y-2">
                  <Label htmlFor="polres">Polres</Label>
                  <Select value={formData.polresId} onValueChange={(value) => setFormData({ ...formData, polresId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Polres" />
                    </SelectTrigger>
                    <SelectContent>
                      {polres.map((pr) => (
                        <SelectItem key={pr.id} value={pr.id}>{pr.name} - {pr.polda.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>) : ('Simpan')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="search">Cari</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="search" placeholder="Cari NRP, nama, email..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Semua status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={roleFilter} onValueChange={handleRoleFilter}>
                <SelectTrigger><SelectValue placeholder="Semua role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua role</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="KORLANTAS">Korlantas</SelectItem>
                  <SelectItem value="POLDA">Polda</SelectItem>
                  <SelectItem value="POLRES">Polres</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="polda">Polda</Label>
              <Select value={poldaFilter} onValueChange={handlePoldaFilter}>
                <SelectTrigger><SelectValue placeholder="Semua Polda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Polda</SelectItem>
                  {poldas.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {poldaFilter !== 'ALL' && (
              <div className="space-y-2">
                <Label htmlFor="polres">Polres</Label>
                <Select value={polresFilter} onValueChange={handlePolresFilter}>
                  <SelectTrigger><SelectValue placeholder="Semua Polres" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Polres</SelectItem>
                    {polresForFilter.map((pr) => (<SelectItem key={pr.id} value={pr.id}>{pr.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Total Data</Label>
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageSize">Data per Halaman</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(parseInt(value)); setPagination(prev => ({ ...prev, page: 1 })) }}>
                <SelectTrigger><SelectValue placeholder="Pilih jumlah data" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 data</SelectItem>
                  <SelectItem value="10">10 data</SelectItem>
                  <SelectItem value="20">20 data</SelectItem>
                  <SelectItem value="50">50 data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              Tidak ada data pengguna
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">NRP: {user.nrp}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {user.polres ? (
                    <div>
                      <div className="font-medium">{user.polres.name}</div>
                      <div className="text-gray-500 text-xs">{user.polres.polda.name}</div>
                    </div>
                  ) : (
                    '-'
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Daftar: {new Date(user.createdAt).toLocaleDateString('id-ID')}
                </div>
                
                <div className="flex flex-wrap gap-1 pt-2">
                  {user.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100" onClick={() => openConfirmDialog('approve', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'approve'}>
                        {actionLoading.userId === user.id && actionLoading.type === 'approve' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<><CheckCircle className="mr-1 h-3 w-3 text-white" />Setujui</>)}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-yellow-600 border-yellow-200 text-white hover:bg-yellow-100" onClick={() => openConfirmDialog('reject', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'reject'}>
                        {actionLoading.userId === user.id && actionLoading.type === 'reject' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<><XCircle className="mr-1 h-3 w-3 text-white" />Tolak</>)}
                      </Button>
                    </>
                  )}
                  {user.status === 'APPROVED' && (
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100" onClick={() => openConfirmDialog('reset', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'reset'}>
                      {actionLoading.userId === user.id && actionLoading.type === 'reset' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<>Reset Pass</>)}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100" onClick={() => openConfirmDialog('delete', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'delete'}>
                    {actionLoading.userId === user.id && actionLoading.type === 'delete' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<><Trash2 className="mr-1 h-3 w-3 text-white" />Hapus</>)}
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
                  <TableHead>NRP</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Polres/Polda</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="w-[200px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">Tidak ada data pengguna</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nrp}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.polres ? (
                          <div className="text-sm">
                            <div className="font-medium">{user.polres.name}</div>
                            <div className="text-gray-500 text-xs">{user.polres.polda.name}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.status === 'PENDING' && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-green-600 border-green-200 text-white hover:bg-green-100" onClick={() => openConfirmDialog('approve', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'approve'}>
                                {actionLoading.userId === user.id && actionLoading.type === 'approve' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<><CheckCircle className="mr-1 h-3 w-3 text-white" />Setujui</>)}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-yellow-600 border-yellow-200 text-white hover:bg-yellow-100" onClick={() => openConfirmDialog('reject', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'reject'}>
                                {actionLoading.userId === user.id && actionLoading.type === 'reject' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<><XCircle className="mr-1 h-3 w-3 text-white" />Tolak</>)}
                              </Button>
                            </>
                          )}
                          {user.status === 'APPROVED' && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-blue-600 border-blue-200 text-white hover:bg-blue-100" onClick={() => openConfirmDialog('reset', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'reset'}>
                              {actionLoading.userId === user.id && actionLoading.type === 'reset' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<>Reset Pass</>)}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-red-600 border-red-200 text-white hover:bg-red-100" onClick={() => openConfirmDialog('delete', user.id, user.name)} disabled={actionLoading.userId === user.id && actionLoading.type === 'delete'}>
                            {actionLoading.userId === user.id && actionLoading.type === 'delete' ? (<><Loader2 className="mr-1 h-3 w-3 animate-spin" />Menyimpan...</>) : (<><Trash2 className="mr-1 h-3 w-3 text-white" />Hapus</>)}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(pagination.page - 1)} className={!pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>

                  {(() => {
                    const pages: (number | string)[] = []
                    const totalPages = pagination.totalPages
                    const currentPage = pagination.page
                    pages.push(1)
                    if (totalPages <= 7) {
                      for (let i = 2; i <= totalPages; i++) pages.push(i)
                    } else {
                      if (currentPage > 3) pages.push('...')
                      const start = Math.max(2, currentPage - 1)
                      const end = Math.min(totalPages - 1, currentPage + 1)
                      for (let i = start; i <= end; i++) if (!pages.includes(i)) pages.push(i)
                      if (currentPage < totalPages - 2) pages.push('...')
                      if (totalPages > 1) pages.push(totalPages)
                    }
                    return pages.map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-gray-500">...</span>
                        ) : (
                          <PaginationLink onClick={() => handlePageChange(page as number)} isActive={page === currentPage} className="cursor-pointer">{page}</PaginationLink>
                        )}
                      </PaginationItem>
                    ))
                  })()}

                  <PaginationItem>
                    <PaginationNext onClick={() => handlePageChange(pagination.page + 1)} className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center mt-4 text-sm text-gray-500">Menampilkan {((pagination.page - 1) * pageSize) + 1} - {Math.min(pagination.page * pageSize, pagination.total)} dari {pagination.total} data</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={closeConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === 'approve' ? 'Setujui Pengguna' :
                confirmDialog.type === 'reject' ? 'Tolak Pengguna' :
                confirmDialog.type === 'reset' ? 'Reset Password' :
                'Hapus Pengguna'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              {confirmDialog.type === 'approve'
                ? `Apakah Anda yakin ingin menyetujui pengguna "${confirmDialog.userName}"?`
                : confirmDialog.type === 'reject'
                  ? `Apakah Anda yakin ingin menolak pengguna "${confirmDialog.userName}"?`
                  : confirmDialog.type === 'reset'
                    ? `Reset password untuk pengguna "${confirmDialog.userName}"?` 
                    : `Apakah Anda yakin ingin menghapus pengguna "${confirmDialog.userName}"?`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog}>Batal</Button>
            <Button onClick={handleConfirmAction} variant={confirmDialog.type === 'delete' ? 'destructive' : 'default'} disabled={actionLoading.userId !== null}>
              {actionLoading.userId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {confirmDialog.type === 'approve' ? 'Menyetujui...' : confirmDialog.type === 'reject' ? 'Menolak...' : confirmDialog.type === 'reset' ? 'Mereset...' : 'Menghapus...'}
                </>
              ) : (
                <>
                  {confirmDialog.type === 'approve' ? 'Setujui' : confirmDialog.type === 'reject' ? 'Tolak' : confirmDialog.type === 'reset' ? 'Reset' : 'Hapus'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
