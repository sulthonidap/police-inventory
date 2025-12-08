"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, UserPlus, Trash2, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useDebounce } from "@/hooks/use-debounce"

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

interface UsersViewProps {
    initialUsers: User[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export function UsersView({ initialUsers, pagination }: UsersViewProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    // URL State
    const currentSearch = searchParams.get("q") || ""
    const currentStatus = searchParams.get("status") || "ALL"
    const currentRole = searchParams.get("role") || "ALL"
    const currentPolda = searchParams.get("poldaId") || "ALL"
    const currentPolres = searchParams.get("polresId") || "ALL"
    const currentPage = parseInt(searchParams.get("page") || "1")

    // Local State
    const [searchTerm, setSearchTerm] = useState(currentSearch)
    const debouncedSearch = useDebounce(searchTerm, 500)

    // Auxiliary Data (Poldas/Polres for filters/forms) - fetched client side for now as they are smallish lists usually, 
    // or could be passed from server. For simplicity/speed, I'll keep the client fetch for dropdown options, or better:
    // Since we are optimizing, passing them from Server Component would be best. 
    // But let's stick to the pattern of "Data is Server, Interaction is Client". 
    // Fetching options client-side is acceptable for now.
    const [poldas, setPoldas] = useState<PoldaOption[]>([])
    const [polres, setPolres] = useState<Polres[]>([])

    // ... (keep existing state for Modals/Forms)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        nrp: "", name: "", email: "", password: "", role: "", poldaId: "", polresId: ""
    })
    // Search states for dropdowns
    const [poldaSearch, setPoldaSearch] = useState("")
    const [polresForFormSearch, setPolresForFormSearch] = useState("")
    const [polresForForm, setPolresForForm] = useState<Polres[]>([])

    const filteredPoldas = poldas.filter(polda => polda.name.toLowerCase().includes(poldaSearch.toLowerCase()))
    const filteredPolresForForm = polresForForm.filter(polres => polres.name.toLowerCase().includes(polresForFormSearch.toLowerCase()))

    // Confirm Actions State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean
        type: 'approve' | 'reject' | 'delete' | 'reset' | null
        userId: string | null
        userName: string | null
    }>({ isOpen: false, type: null, userId: null, userName: null })

    // Sync Search
    useEffect(() => {
        if (debouncedSearch !== currentSearch) {
            handleFilterChange('q', debouncedSearch)
        }
    }, [debouncedSearch])

    // Initial Data Fetch for Options
    useEffect(() => {
        fetchPoldas()
        // We don't fetch ALL polres at once if list is huge, usually depend on polda. 
        // But existing code did fetchPolres().
        // fetchPolres() 
    }, [])

    const fetchPoldas = async () => {
        try {
            const res = await fetch('/api/polda/simple')
            const data = await res.json()
            setPoldas(data)
        } catch (e) { console.error(e) }
    }

    // URL Update Helper
    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "ALL") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        // Reset page
        if (key !== "page") params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    // Dependent Select Logic for Form
    useEffect(() => {
        const loadPolresForForm = async () => {
            if (['USER', 'TEKNISI', 'POLRES'].includes(formData.role)) {
                if (!formData.poldaId) {
                    setPolresForForm([])
                    return
                }
                try {
                    const res = await fetch(`/api/polres/simple?poldaId=${formData.poldaId}`)
                    if (res.ok) {
                        const data = await res.json()
                        setPolresForForm(data)
                    }
                } catch (e) { console.error(e) }
            } else {
                setPolresForForm([])
            }
        }
        loadPolresForForm()
    }, [formData.role, formData.poldaId])


    // Actions
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (response.ok) {
                setIsModalOpen(false)
                setFormData({ nrp: "", name: "", email: "", password: "", role: "", poldaId: "", polresId: "" })
                toast({ variant: "success", title: "Berhasil!", description: "Pengguna baru berhasil ditambahkan" })
                router.refresh()
            } else {
                const error = await response.json()
                toast({ variant: "destructive", title: "Error", description: error.message || "Gagal menambahkan pengguna" })
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAction = async () => {
        if (!confirmDialog.userId || !confirmDialog.type) return
        const { type, userId } = confirmDialog
        let url = ''
        let method = 'PATCH'

        if (type === 'approve') url = `/api/users/${userId}/approve`
        else if (type === 'reject') url = `/api/users/${userId}/reject`
        else if (type === 'reset') url = `/api/users/${userId}/reset-password`
        else if (type === 'delete') { url = `/api/users/${userId}`; method = 'DELETE' }

        try {
            const res = await fetch(url, { method })
            const data = await res.json()

            if (res.ok) {
                toast({ variant: type === 'reject' ? 'warning' : 'success', title: "Berhasil", description: "Aksi berhasil dilakukan" })
                if (type === 'reset') {
                    // Show password logic
                    toast({
                        variant: "success",
                        title: "Password direset",
                        description: (
                            <div className="flex items-center gap-2">
                                <span>Password baru:</span>
                                <code className="px-1 py-0.5 bg-white/70 rounded text-gray-900">{data.password}</code>
                            </div>
                        )
                    })
                }
                router.refresh()
            } else {
                toast({ variant: "destructive", title: "Error", description: data.error || "Gagal melakukan aksi" })
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Terjadi kesalahan sistem" })
        } finally {
            setConfirmDialog({ isOpen: false, type: null, userId: null, userName: null })
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>
            case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-800">Menunggu Approval</Badge>
            case 'REJECTED': return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getRoleBadge = (role: string) => {
        const roleColors: any = {
            'ADMIN': 'bg-purple-100 text-purple-800',
            'KORLANTAS': 'bg-blue-100 text-blue-800',
            'POLDA': 'bg-indigo-100 text-indigo-800',
            'POLRES': 'bg-cyan-100 text-cyan-800',
            'USER': 'bg-gray-100 text-gray-800'
        }
        return <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>
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
                        <Button><UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Tambah Pengguna Baru</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Simplified Form Inputs mapped from State */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>NRP</Label><Input value={formData.nrp} onChange={e => setFormData({ ...formData, nrp: e.target.value })} required /></div>
                                <div className="space-y-2"><Label>Nama</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                            </div>
                            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Password</Label><Input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required /></div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="TEKNISI">Teknisi</SelectItem>
                                        <SelectItem value="POLRES">Polres</SelectItem>
                                        <SelectItem value="POLDA">Polda</SelectItem>
                                        <SelectItem value="KORLANTAS">Korlantas</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Conditional Polda/Polres Selects based on Role - Simplified Logic */}
                            {(formData.role === 'POLDA' || formData.role === 'USER' || formData.role === 'TEKNISI' || formData.role === 'POLRES') && (
                                <div className="space-y-2">
                                    <Label>Polda</Label>
                                    <Select value={formData.poldaId} onValueChange={(v) => setFormData({ ...formData, poldaId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Polda" /></SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2"><Input placeholder="Cari..." value={poldaSearch} onChange={e => setPoldaSearch(e.target.value)} /></div>
                                            {filteredPoldas.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {(formData.role === 'USER' || formData.role === 'TEKNISI' || formData.role === 'POLRES') && (
                                <div className="space-y-2">
                                    <Label>Polres</Label>
                                    <Select value={formData.polresId} onValueChange={(v) => setFormData({ ...formData, polresId: v })} disabled={!formData.poldaId}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Polres" /></SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2"><Input placeholder="Cari..." value={polresForFormSearch} onChange={e => setPolresForFormSearch(e.target.value)} /></div>
                                            {filteredPolresForForm.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button type="submit" disabled={isSubmitting} className="w-full">Simpan</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter Section */}
            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-4">
                        <div className="space-y-2">
                            <Label>Cari</Label>
                            <Input placeholder="Cari user..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={currentStatus} onValueChange={v => handleFilterChange('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua</SelectItem>
                                    <SelectItem value="APPROVED">Disetujui</SelectItem>
                                    <SelectItem value="PENDING">Menunggu</SelectItem>
                                    <SelectItem value="REJECTED">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={currentRole} onValueChange={v => handleFilterChange('role', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="POLDA">Polda</SelectItem>
                                    <SelectItem value="POLRES">Polres</SelectItem>
                                    <SelectItem value="USER">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Dynamic Filters for Polda/Polres could go here too but omitting for brevity if not strictly required, 
                 typically Admin wants to filter by Polda. */}
                        <div className="space-y-2">
                            <Label>&nbsp;</Label>
                            <Button variant="outline" onClick={() => router.push(pathname)} className="w-full">Reset</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>NRP</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Satuan Kerja</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8">Tidak ada data</TableCell></TableRow>
                            ) : (
                                initialUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.nrp}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            {user.polres ? `${user.polres.name} (${user.polres.polda.name})` : '-'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setConfirmDialog({ isOpen: true, type: 'reset', userId: user.id, userName: user.name })}>Reset Password</DropdownMenuItem>
                                                    {user.status === 'PENDING' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => setConfirmDialog({ isOpen: true, type: 'approve', userId: user.id, userName: user.name })}>Setujui</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setConfirmDialog({ isOpen: true, type: 'reject', userId: user.id, userName: user.name })}>Tolak</DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuItem className="text-red-600" onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', userId: user.id, userName: user.name })}>Hapus</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-4 flex justify-end">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                                    </PaginationItem>
                                    <PaginationItem><span className="px-4 py-2">Halaman {currentPage}</span></PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(p => ({ ...p, isOpen: false }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Aksi</DialogTitle>
                    </DialogHeader>
                    <p>
                        Apakah Anda yakin ingin melakukan aksi <strong>{confirmDialog.type}</strong> pada user <strong>{confirmDialog.userName}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}>Batal</Button>
                        <Button variant={confirmDialog.type === 'delete' ? 'destructive' : 'default'} onClick={handleAction}>Ya, Lanjutkan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
