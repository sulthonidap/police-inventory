"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogOverlay } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Edit, Trash2, Eye, Loader2, Search } from "lucide-react"
import { ReportForm } from "@/components/forms/ReportForm"
import { useToast } from "@/hooks/use-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useDebounce } from "@/hooks/use-debounce"

interface Report {
    id: string
    title: string
    type: string
    customType?: string
    status: string
    description: string
    content?: string
    user: { name: string; nrp: string }
    polda: { id: string; name: string } | null
    polres: { id: string; name: string } | null
    createdAt: string
    updatedAt: string
}

interface CustomReportType { id: string; name: string; description?: string; isActive: boolean }
interface Polres { id: string; name: string; poldaId?: string }
interface Polda { id: string; name: string }

interface ReportsViewProps {
    initialReports: Report[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export function ReportsView({ initialReports, pagination }: ReportsViewProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    // URL State
    const searchQuery = searchParams.get("search") || ""
    const statusFilter = searchParams.get("status") || "all"
    const typeFilter = searchParams.get("type") || "all"
    const currentPage = parseInt(searchParams.get("page") || "1")

    // Local State
    const [searchTerm, setSearchTerm] = useState(searchQuery)
    const debouncedSearch = useDebounce(searchTerm, 500)

    // Options State (Client Side Fetch)
    const [polres, setPolres] = useState<Polres[]>([])
    const [polresForForm, setPolresForForm] = useState<Polres[]>([])
    const [poldas, setPoldas] = useState<Polda[]>([])
    const [customTypes, setCustomTypes] = useState<CustomReportType[]>([])

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isCustomTypeModalOpen, setIsCustomTypeModalOpen] = useState(false)
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)

    // Forms
    const [formData, setFormData] = useState({
        title: "", type: "", customType: "", description: "", poldaId: "", polresId: ""
    })
    const [customTypeFormData, setCustomTypeFormData] = useState({ name: "", description: "" })

    // Sync Search
    useEffect(() => {
        if (debouncedSearch !== searchQuery) {
            handleFilterChange('search', debouncedSearch)
        }
    }, [debouncedSearch])

    // Fetch Options
    useEffect(() => {
        fetchPolres()
        fetchPoldas()
        fetchCustomTypes()
    }, [])

    // Dependent Select
    useEffect(() => {
        const loadPolresForForm = async () => {
            if (!formData.poldaId) {
                setPolresForForm([])
                setFormData(prev => ({ ...prev, polresId: "" }))
                return
            }
            try {
                const res = await fetch(`/api/polres/simple?poldaId=${formData.poldaId}`)
                const data = await res.json()
                setPolresForForm(data)
                if (!data.find((p: Polres) => p.id === formData.polresId)) {
                    setFormData(prev => ({ ...prev, polresId: "" }))
                }
            } catch (e) { console.error(e) }
        }
        loadPolresForForm()
    }, [formData.poldaId])


    const fetchPolres = async () => { try { const res = await fetch('/api/polres/simple'); if (res.ok) setPolres(await res.json()) } catch (e) { } }
    const fetchPoldas = async () => { try { const res = await fetch('/api/polda/simple'); if (res.ok) setPoldas(await res.json()) } catch (e) { } }
    const fetchCustomTypes = async () => { try { const res = await fetch('/api/reports/custom-types'); if (res.ok) setCustomTypes(await res.json()) } catch (e) { } }

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "all") params.set(key, value)
        else params.delete(key)
        if (key !== "page") params.set("page", "1")
        router.push(`${pathname}?${params.toString()}`)
    }
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    // --- ACTIONS ---
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
                router.refresh()
            } else {
                const error = await response.json()
                toast({ title: "Error", description: error.error || "Gagal", variant: "destructive" })
            }
        } catch (e) { toast({ title: "Error", description: "Terjadi kesalahan", variant: "destructive" }) }
        finally { setIsSubmitting(false) }
    }

    const handleTicketSubmit = async (data: any) => {
        setIsSubmitting(true)
        try {
            const fd = new FormData()
            fd.append('reportType', data.reportType)
            fd.append('problemType', data.problemType)
            fd.append('description', data.description)
            if (data.selectedAsset) {
                fd.append('assetId', data.selectedAsset.id)
                fd.append('assetName', data.selectedAsset.name)
                fd.append('assetInventoryNumber', data.selectedAsset.inventoryNumber)
            }
            data.attachments.forEach((file: File, index: number) => {
                fd.append(`attachment_${index}`, file)
            })

            const response = await fetch('/api/reports', { method: 'POST', body: fd })
            const result = await response.json()
            if (response.ok) {
                toast({ title: "Sukses", description: "Tiket bantuan berhasil dikirim" })
                setIsTicketModalOpen(false)
                router.refresh()
            } else {
                toast({ title: "Error", description: result.error || "Gagal", variant: "destructive" })
            }
        } catch (e) { toast({ title: "Error", description: "Terjadi kesalahan", variant: "destructive" }) }
        finally { setIsSubmitting(false) }
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
                toast({ title: "Sukses", description: "Laporan diperbarui" })
                setIsEditModalOpen(false)
                resetForm()
                router.refresh()
            } else {
                const error = await response.json()
                toast({ title: "Error", description: error.error || "Gagal", variant: "destructive" })
            }
        } catch (e) { toast({ title: "Error", description: "Error", variant: "destructive" }) }
        finally { setIsSubmitting(false) }
    }

    const handleDelete = async () => {
        if (!selectedReport) return
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/reports/${selectedReport.id}`, { method: 'DELETE' })
            if (response.ok) {
                toast({ title: "Sukses", description: "Laporan dihapus" })
                setIsDeleteModalOpen(false)
                setSelectedReport(null)
                router.refresh()
            } else {
                const error = await response.json()
                toast({ title: "Error", description: error.error || "Gagal", variant: "destructive" })
            }
        } catch (e) { toast({ title: "Error", description: "Error", variant: "destructive" }) }
        finally { setIsSubmitting(false) }
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
                toast({ title: "Sukses", description: "Tipe kustom dibuat" })
                setIsCustomTypeModalOpen(false)
                setCustomTypeFormData({ name: "", description: "" })
                fetchCustomTypes()
            } else {
                toast({ title: "Error", description: "Gagal", variant: "destructive" })
            }
        } catch (e) { toast({ title: "Error", description: "Error", variant: "destructive" }) }
    }

    const handleExport = async (reportId: string, format: 'pdf' | 'excel') => {
        // Export Logic
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
                document.body.removeChild(a)
                toast({ title: "Sukses", description: `Export ${format} berhasil` })
            } else {
                toast({ title: "Error", description: "Gagal export", variant: "destructive" })
            }
        } catch (e) { toast({ title: "Error", description: "Error export", variant: "destructive" }) }
    }


    const resetForm = () => {
        setFormData({ title: "", type: "", customType: "", description: "", poldaId: "", polresId: "" })
        setPolresForForm([])
        setSelectedReport(null)
    }

    const openEditModal = async (report: Report) => {
        setSelectedReport(report)
        const newFormData = {
            title: report.title, type: report.type, customType: report.customType || "",
            description: report.description, poldaId: report.polda?.id || "", polresId: report.polres?.id || ""
        }
        setFormData(newFormData)
        if (newFormData.poldaId) {
            const res = await fetch(`/api/polres/simple?poldaId=${newFormData.poldaId}`)
            const data = await res.json()
            setPolresForForm(data)
        }
        setIsEditModalOpen(true)
    }

    // -- UI Helpers --
    const getStatusBadge = (status: string) => {
        const color = {
            'DRAFT': 'bg-gray-100 text-gray-800', 'SUBMITTED': 'bg-blue-100 text-blue-800',
            'REVIEWED': 'bg-yellow-100 text-yellow-800', 'APPROVED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800'
        }[status] || 'bg-gray-100'
        return <Badge className={color}>{status}</Badge>
    }
    const getTypeBadge = (type: string, custom?: string) => {
        return <Badge variant="outline">{type === 'CUSTOM' ? custom : type}</Badge>
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Manajemen Laporan</h1>
                    <p className="text-muted-foreground">Kelola data laporan dan dokumen</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
                        <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><FileText className="mr-2 h-4 w-4" />Buat Tiket</Button></DialogTrigger>
                        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
                        <DialogContent className="sm:max-w-[1400px] max-h-[98vh] overflow-y-auto">
                            <ReportForm onSubmit={handleTicketSubmit} isSubmitting={isSubmitting} />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="mr-2 h-4 w-4" />Buat Laporan
                            </Button>
                        </DialogTrigger>
                        <DialogOverlay className="bg-black/30 backdrop-blur-sm" />
                        <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Buat Laporan Baru</DialogTitle></DialogHeader>
                            <form onSubmit={handleCreateReport} className="space-y-4">
                                {/* Simplified form fields for brevity -- in real implementation should match full form structure */}
                                <div className="space-y-2"><Label>Judul</Label><Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipe</Label>
                                        <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v, customType: '' })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UMUM">Umum</SelectItem>
                                                <SelectItem value="INTERNAL">Internal</SelectItem>
                                                <SelectItem value="CUSTOM">Kustom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* Add Custom Type Button & Select would go here */}
                                </div>
                                <div className="space-y-2"><Label>Deskripsi</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required /></div>
                                <DialogFooter><Button type="submit" disabled={isSubmitting}>Simpan</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        <div className="space-y-2"><Label>Cari</Label><Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cari..." /></div>
                        <div className="space-y-2"><Label>Status</Label>
                            <Select value={statusFilter} onValueChange={v => handleFilterChange('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="SUBMITTED">Dikirim</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Tipe</Label>
                            <Select value={typeFilter} onValueChange={v => handleFilterChange('type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="UMUM">Umum</SelectItem><SelectItem value="CUSTOM">Kustom</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>&nbsp;</Label><Button variant="outline" className="w-full" onClick={() => { setSearchTerm(''); router.push(pathname) }}>Reset</Button></div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="pt-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Judul</TableHead><TableHead>Tipe</TableHead><TableHead>Status</TableHead><TableHead>Polda/Polres</TableHead><TableHead>Tanggal</TableHead><TableHead>Aksi</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {initialReports.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada data</TableCell></TableRow> :
                                initialReports.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.user?.nrp}</div></TableCell>
                                        <TableCell>{getTypeBadge(r.type, r.customType)}</TableCell>
                                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                                        <TableCell>{r.polda?.name || '-'}/{r.polres?.name || '-'}</TableCell>
                                        <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedReport(r); setIsViewModalOpen(true) }}><Eye className="w-3 h-3" /></Button>
                                                <Button size="sm" variant="outline" onClick={() => openEditModal(r)}><Edit className="w-3 h-3" /></Button>
                                                <Button size="sm" variant="outline" onClick={() => handleExport(r.id, 'pdf')}><FileText className="w-3 h-3" /></Button>
                                                <Button size="sm" variant="destructive" onClick={() => { setSelectedReport(r); setIsDeleteModalOpen(true) }}><Trash2 className="w-3 h-3" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
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

            {/* Confirm Delete */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent><DialogHeader><DialogTitle>Hapus Laporan?</DialogTitle></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button><Button variant="destructive" onClick={handleDelete}>Hapus</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[800px]"><DialogHeader><DialogTitle>Detail Laporan</DialogTitle></DialogHeader>
                    {selectedReport && (
                        <div className="space-y-4">
                            <div><h3 className="font-bold">{selectedReport.title}</h3><p>{selectedReport.description}</p></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>Label: {getTypeBadge(selectedReport.type, selectedReport.customType)}</div>
                                <div>Status: {getStatusBadge(selectedReport.status)}</div>
                                <div>Pelapor: {selectedReport.user?.name}</div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
