"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calendar, MapPin, Building, User, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Polda {
  id: string
  name: string
}

interface Polres {
  id: string
  name: string
  poldaId: string
}

interface User {
  id: string
  name: string
  nrp: string
}

interface AssetFormData {
  // Section 1: Identitas Aset
  name: string
  inventoryNumber: string
  kind: string
  categoryLevel1: string
  registrationDate: string

  // Section 2: Identitas Aset (Wilayah)
  sourceRegionId: string
  operationalRegionId: string
  polresId: string

  // Section 3: Data Sumber dan Status Aset
  source: string
  sourceDetail: string
  sourceCompanyName: string
  sourceCompanyAddress: string
  sourceCompanyProvince: string
  sourceCompanyRegency: string
  sourceCompanyDistrict: string
  sourceCompanyVillage: string
  sourceCompanyRepName: string
  sourceCompanyRepEmail: string
  sourceCompanyRepPhone: string
  
  // Untuk Pinjam Pakai
  loanRegionId: string
  usageRegionId: string
  loanRepName: string
  loanRepEmail: string
  loanRepPhone: string
  loanDocumentFile: string

  // Section 4: Status Pemeliharaan dan Perawatan
  maintenanceStatus: string
  simakData: string[]
  maintenanceCompanyName: string
  maintenanceCompanyAddress: string
  maintenanceCompanyProvince: string
  maintenanceCompanyRegency: string
  maintenanceCompanyDistrict: string
  maintenanceCompanyVillage: string
  maintenanceRepName: string
  maintenanceRepEmail: string
  maintenanceRepPhone: string
  maintenanceValidityDate: string
  
  // Untuk Non-Aktif
  inactiveSimakData: string[]
  inactiveSimakInstitution: string
  inactiveReason: string
}

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => Promise<void>
  isSubmitting?: boolean
  initialData?: Partial<AssetFormData>
}

const SIMAK_OPTIONS = [
  "Simak Korlantas",
  "Simak Polda", 
  "Simak lembaga/instansi lain"
]

const INACTIVE_SIMAK_OPTIONS = [
  "Simak Korlantas",
  "Simak Polda",
  "Simak lembaga/instansi lain",
  "Belum terdaftar dalam simak manapun"
]

export function AssetForm({ onSubmit, isSubmitting = false, initialData }: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    // Section 1
    name: "",
    inventoryNumber: "",
    kind: "",
    categoryLevel1: "",
    registrationDate: new Date().toISOString().split('T')[0],

    // Section 2
    sourceRegionId: "",
    operationalRegionId: "",
    polresId: "",

    // Section 3
    source: "",
    sourceDetail: "",
    sourceCompanyName: "",
    sourceCompanyAddress: "",
    sourceCompanyProvince: "",
    sourceCompanyRegency: "",
    sourceCompanyDistrict: "",
    sourceCompanyVillage: "",
    sourceCompanyRepName: "",
    sourceCompanyRepEmail: "",
    sourceCompanyRepPhone: "",
    
    // Pinjam Pakai
    loanRegionId: "",
    usageRegionId: "",
    loanRepName: "",
    loanRepEmail: "",
    loanRepPhone: "",
    loanDocumentFile: "",

    // Section 4
    maintenanceStatus: "",
    simakData: [],
    maintenanceCompanyName: "",
    maintenanceCompanyAddress: "",
    maintenanceCompanyProvince: "",
    maintenanceCompanyRegency: "",
    maintenanceCompanyDistrict: "",
    maintenanceCompanyVillage: "",
    maintenanceRepName: "",
    maintenanceRepEmail: "",
    maintenanceRepPhone: "",
    maintenanceValidityDate: "",
    
    // Non-Aktif
    inactiveSimakData: [],
    inactiveSimakInstitution: "",
    inactiveReason: "",
    ...initialData
  })

  const [poldas, setPoldas] = useState<Polda[]>([])
  const [polres, setPolres] = useState<Polres[]>([])
  const [isLoadingPoldas, setIsLoadingPoldas] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPoldas()
  }, [])

  useEffect(() => {
    if (formData.operationalRegionId && formData.operationalRegionId !== "KORLANTAS") {
      fetchPolresByPolda(formData.operationalRegionId)
    } else {
      setPolres([])
    }
    // Reset polresId when operational region changes
    setFormData(prev => ({ ...prev, polresId: "" }))
  }, [formData.operationalRegionId])

  const fetchPoldas = async () => {
    try {
      console.log('Fetching poldas...')
      setIsLoadingPoldas(true)
      const response = await fetch('/api/polda/simple')
      const data = await response.json()
      console.log('Poldas response:', data)
      if (Array.isArray(data)) {
        console.log('Setting poldas:', data)
        setPoldas(data)
      } else if (data.poldas) {
        console.log('Setting poldas from data.poldas:', data.poldas)
        setPoldas(data.poldas)
      }
    } catch (error) {
      console.error('Error fetching poldas:', error)
    } finally {
      setIsLoadingPoldas(false)
    }
  }

  const fetchPolresByPolda = async (poldaId: string) => {
    try {
      const response = await fetch(`/api/polres/simple?poldaId=${poldaId}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setPolres(data)
      }
    } catch (error) {
      console.error('Error fetching polres:', error)
    }
  }

  const getCategoryOptions = (kind: string) => {
    switch (kind) {
      case "DIGITAL_IT":
        return [
          "Aplikasi Mobile",
          "Aplikasi Web", 
          "Platform",
          "Lainnya sebutkan (permohonan penambahan kategori baru)"
        ]
      case "BARANG":
        return [
          "Peralatan ETLE",
          "Kendaraan",
          "Senjata", 
          "Komputer",
          "Server",
          "Alat komunikasi",
          "Lainnya sebutkan (permohonan penambahan kategori baru)"
        ]
      case "JASA":
        return [
          "Jasa Periklanan",
          "Jasa media dan berita",
          "Jasa Humas",
          "Lainnya sebutkan (permohonan penambahan kategori baru)"
        ]
      default:
        return []
    }
  }

  const handleSimakChange = (value: string, checked: boolean) => {
    if (formData.maintenanceStatus === "AKTIF") {
      setFormData(prev => ({
        ...prev,
        simakData: checked 
          ? [...prev.simakData, value]
          : prev.simakData.filter(item => item !== value)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        inactiveSimakData: checked 
          ? [...prev.inactiveSimakData, value]
          : prev.inactiveSimakData.filter(item => item !== value)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-lg">
            <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Tambah Aset Baru</h2>
          <p className="text-sm md:text-lg text-gray-600 px-4 md:px-0">Isi form di bawah ini untuk menambahkan aset baru ke sistem</p>
        </div>

        {/* Section 1: Identitas Aset */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold text-blue-900 flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs md:text-sm">1</span>
              </div>
              <span className="truncate">Identitas Aset</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nama Aset *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama aset"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="inventoryNumber" className="text-sm font-medium text-gray-700">No. Inventaris *</Label>
              <Input
                id="inventoryNumber"
                value={formData.inventoryNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, inventoryNumber: e.target.value }))}
                placeholder="Masukkan nomor inventaris"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="kind" className="text-sm font-medium text-gray-700">Jenis Aset *</Label>
              <Select value={formData.kind} onValueChange={(value) => setFormData(prev => ({ ...prev, kind: value, categoryLevel1: "" }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih jenis aset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIGITAL_IT">Digital (IT)</SelectItem>
                  <SelectItem value="BARANG">Barang</SelectItem>
                  <SelectItem value="JASA">Jasa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="categoryLevel1" className="text-sm font-medium text-gray-700">Kategori Aset *</Label>
              <Select value={formData.categoryLevel1} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryLevel1: value }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih kategori aset" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions(formData.kind).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section 2: Identitas Aset (Wilayah) */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold text-green-900 flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs md:text-sm">2</span>
              </div>
              <span className="truncate">Identitas Aset (Wilayah)</span>
            </h3>
          </div>
          <div className="space-y-4">
            <Label className="text-sm text-gray-600">Pilih wilayah sumber aset yang akan didaftarkan (bisa sama dengan lokasi operasional aset)</Label>
            <div className="space-y-3">
              <Label htmlFor="sourceRegion" className="text-sm font-medium text-gray-700">Wilayah sumber *</Label>
              <Select value={formData.sourceRegionId} onValueChange={(value) => setFormData(prev => ({ ...prev, sourceRegionId: value }))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Dropdown Wilayah Korlantas dan polda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KORLANTAS">Korlantas</SelectItem>
                  {isLoadingPoldas ? (
                    <SelectItem value="loading" disabled>Loading poldas...</SelectItem>
                  ) : poldas.length > 0 ? poldas.map((polda) => (
                    <SelectItem key={polda.id} value={polda.id}>
                      {polda.name}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-data" disabled>Tidak ada data polda</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm text-gray-600">Pilih wilayah operasional aset yang akan didaftarkan (bisa sama dengan wilayah sumber aset)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-3">
                <Label htmlFor="operationalRegion" className="text-sm font-medium text-gray-700">Wilayah Operasional *</Label>
                <Select value={formData.operationalRegionId} onValueChange={(value) => setFormData(prev => ({ ...prev, operationalRegionId: value, polresId: "" }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Dropdown Wilayah Korlantas dan polda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KORLANTAS">Korlantas</SelectItem>
                    {isLoadingPoldas ? (
                      <SelectItem value="loading" disabled>Loading poldas...</SelectItem>
                    ) : poldas.length > 0 ? poldas.map((polda) => (
                      <SelectItem key={polda.id} value={polda.id}>
                        {polda.name}
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-data" disabled>Tidak ada data polda</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="polres" className="text-sm font-medium text-gray-700">Pilih polres *</Label>
                <Select value={formData.polresId} onValueChange={(value) => setFormData(prev => ({ ...prev, polresId: value }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Dropdown Pilih Polres" />
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
              <div className="space-y-3">
                <Label htmlFor="registrationDate" className="text-sm font-medium text-gray-700">Tanggal pendaftaran aset *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Input
                    id="registrationDate"
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: Data Sumber dan Status Aset */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold text-orange-900 flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs md:text-sm">3</span>
              </div>
              <span className="truncate">Data Sumber dan Status Aset</span>
            </h3>
          </div>
          <div className="space-y-3">
            <Label htmlFor="source" className="text-sm font-medium text-gray-700">Sumber Aset *</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Pilih sumber aset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENGADAAN">Pengadaan</SelectItem>
                <SelectItem value="HIBAH">Hibah</SelectItem>
                <SelectItem value="PINJAM_PAKAI">Pinjam Pakai</SelectItem>
                <SelectItem value="POC">POC</SelectItem>
                <SelectItem value="LAINNYA">Lainnya sebutkan (permohonan penambahan kategori baru)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional fields based on source */}
          {formData.source && formData.source !== "PINJAM_PAKAI" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sourceDetail" className="text-sm font-medium text-gray-700">Asal {formData.source === "PENGADAAN" ? "Pengadaan" : formData.source === "HIBAH" ? "Hibah" : formData.source === "POC" ? "POC" : "Lainnya"} *</Label>
                <Input
                  id="sourceDetail"
                  value={formData.sourceDetail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceDetail: e.target.value }))}
                  placeholder="Masukkan asal sumber"
                  className="h-10"
                  required
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-base font-medium text-gray-900 mb-4">Penanggung jawab {formData.source === "PENGADAAN" ? "Pengadaan" : formData.source === "HIBAH" ? "Hibah" : formData.source === "POC" ? "POC" : "Lainnya"}</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="sourceCompanyName" className="text-sm font-medium text-gray-700">Nama Perusahaan *</Label>
                  <Input
                    id="sourceCompanyName"
                    value={formData.sourceCompanyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyName: e.target.value }))}
                    placeholder="Masukkan nama perusahaan"
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceCompanyAddress" className="text-sm font-medium text-gray-700">Alamat perusahaan</Label>
                  <Input
                    id="sourceCompanyAddress"
                    value={formData.sourceCompanyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyAddress: e.target.value }))}
                    placeholder="Alamat singkat"
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyProvince" className="text-sm font-medium text-gray-700">Propinsi</Label>
                    <Input
                      id="sourceCompanyProvince"
                      value={formData.sourceCompanyProvince}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyProvince: e.target.value }))}
                      placeholder="Propinsi"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyRegency" className="text-sm font-medium text-gray-700">Kabupaten</Label>
                    <Input
                      id="sourceCompanyRegency"
                      value={formData.sourceCompanyRegency}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRegency: e.target.value }))}
                      placeholder="Kabupaten"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyDistrict" className="text-sm font-medium text-gray-700">Kecamatan</Label>
                    <Input
                      id="sourceCompanyDistrict"
                      value={formData.sourceCompanyDistrict}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyDistrict: e.target.value }))}
                      placeholder="Kecamatan"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyVillage" className="text-sm font-medium text-gray-700">Kelurahan/desa</Label>
                    <Input
                      id="sourceCompanyVillage"
                      value={formData.sourceCompanyVillage}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyVillage: e.target.value }))}
                      placeholder="Kelurahan/desa"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-base font-medium text-gray-900 mb-4">Perwakilan perusahaan</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sourceCompanyRepName" className="text-sm font-medium text-gray-700">Nama *</Label>
                      <Input
                        id="sourceCompanyRepName"
                        value={formData.sourceCompanyRepName}
                        onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRepName: e.target.value }))}
                        placeholder="Nama perwakilan"
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sourceCompanyRepEmail" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="sourceCompanyRepEmail"
                        type="email"
                        value={formData.sourceCompanyRepEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRepEmail: e.target.value }))}
                        placeholder="Email perwakilan"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sourceCompanyRepPhone" className="text-sm font-medium text-gray-700">No. telp.</Label>
                      <Input
                        id="sourceCompanyRepPhone"
                        value={formData.sourceCompanyRepPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRepPhone: e.target.value }))}
                        placeholder="No. telp perwakilan"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pinjam Pakai specific fields */}
          {formData.source === "PINJAM_PAKAI" && (
            <>
              <div className="space-y-4">
                <h4 className="font-medium">Asal wilayah pinjam pakai</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="loanRegion">Pilih wilayah Pinjam *</Label>
                    <Select value={formData.loanRegionId} onValueChange={(value) => setFormData(prev => ({ ...prev, loanRegionId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dropdown Korlantas + Wilayah polda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KORLANTAS">Korlantas</SelectItem>
                        {poldas.map((polda) => (
                          <SelectItem key={polda.id} value={polda.id}>
                            {polda.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageRegion">Pilih wilayah pakai *</Label>
                    <Select value={formData.usageRegionId} onValueChange={(value) => setFormData(prev => ({ ...prev, usageRegionId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dropdown Polda" />
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
                </div>

                <Separator />
                <h4 className="font-medium">Penanggung jawab Pinjam Pakai</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="loanRepName">Nama *</Label>
                    <Input
                      id="loanRepName"
                      value={formData.loanRepName}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanRepName: e.target.value }))}
                      placeholder="Nama penanggung jawab"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanRepEmail">Email</Label>
                    <Input
                      id="loanRepEmail"
                      type="email"
                      value={formData.loanRepEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanRepEmail: e.target.value }))}
                      placeholder="Email penanggung jawab"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loanRepPhone">No. telp.</Label>
                    <Input
                      id="loanRepPhone"
                      value={formData.loanRepPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanRepPhone: e.target.value }))}
                      placeholder="No. telp penanggung jawab"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanDocumentFile">File dokumen Berita Acara pinjam Pakai</Label>
                  <Input
                    id="loanDocumentFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData(prev => ({ ...prev, loanDocumentFile: e.target.files?.[0]?.name || "" }))}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section 4: Status Pemeliharaan dan Perawatan */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold text-purple-900 flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-500 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs md:text-sm">4</span>
              </div>
              <span className="truncate">Status Pemeliharaan dan Perawatan</span>
            </h3>
          </div>
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Status Pemeliharaan dan Perawatan *</Label>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="maintenanceStatus"
                  value="AKTIF"
                  checked={formData.maintenanceStatus === "AKTIF"}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceStatus: e.target.value }))}
                  className="rounded"
                />
                <span className="text-sm">Aktif</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="maintenanceStatus"
                  value="NON_AKTIF"
                  checked={formData.maintenanceStatus === "NON_AKTIF"}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceStatus: e.target.value }))}
                  className="rounded"
                />
                <span className="text-sm">Non Aktif</span>
              </label>
            </div>
          </div>

          {/* Aktif fields */}
          {formData.maintenanceStatus === "AKTIF" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data SIMAK</Label>
                <div className="space-y-2">
                  {SIMAK_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.simakData.includes(option)}
                        onChange={(e) => handleSimakChange(option, e.target.checked)}
                        className="rounded"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceCompanyName" className="text-sm font-medium text-gray-700">Nama Perusahaan Pemegang Harwat *</Label>
                <Input
                  id="maintenanceCompanyName"
                  value={formData.maintenanceCompanyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyName: e.target.value }))}
                  placeholder="Masukkan nama perusahaan"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceCompanyAddress" className="text-sm font-medium text-gray-700">Alamat perusahaan</Label>
                <Input
                  id="maintenanceCompanyAddress"
                  value={formData.maintenanceCompanyAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyAddress: e.target.value }))}
                  placeholder="Alamat singkat"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyProvince" className="text-sm font-medium text-gray-700">Propinsi</Label>
                  <Input
                    id="maintenanceCompanyProvince"
                    value={formData.maintenanceCompanyProvince}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyProvince: e.target.value }))}
                    placeholder="Propinsi"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyRegency" className="text-sm font-medium text-gray-700">Kabupaten</Label>
                  <Input
                    id="maintenanceCompanyRegency"
                    value={formData.maintenanceCompanyRegency}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyRegency: e.target.value }))}
                    placeholder="Kabupaten"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyDistrict" className="text-sm font-medium text-gray-700">Kecamatan</Label>
                  <Input
                    id="maintenanceCompanyDistrict"
                    value={formData.maintenanceCompanyDistrict}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyDistrict: e.target.value }))}
                    placeholder="Kecamatan"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyVillage" className="text-sm font-medium text-gray-700">Kelurahan/desa</Label>
                  <Input
                    id="maintenanceCompanyVillage"
                    value={formData.maintenanceCompanyVillage}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyVillage: e.target.value }))}
                    placeholder="Kelurahan/desa"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-base font-medium text-gray-900 mb-4">Perwakilan perusahaan</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceRepName" className="text-sm font-medium text-gray-700">Nama *</Label>
                    <Input
                      id="maintenanceRepName"
                      value={formData.maintenanceRepName}
                      onChange={(e) => setFormData(prev => ({ ...prev, maintenanceRepName: e.target.value }))}
                      placeholder="Nama perwakilan"
                      className="h-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceRepEmail" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="maintenanceRepEmail"
                      type="email"
                      value={formData.maintenanceRepEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, maintenanceRepEmail: e.target.value }))}
                      placeholder="Email perwakilan"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceRepPhone" className="text-sm font-medium text-gray-700">No.telp.</Label>
                    <Input
                      id="maintenanceRepPhone"
                      value={formData.maintenanceRepPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, maintenanceRepPhone: e.target.value }))}
                      placeholder="No. telp perwakilan"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceValidityDate" className="text-sm font-medium text-gray-700">Tanggal masa berlaku harwat *</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Input
                        id="maintenanceValidityDate"
                        type="date"
                        value={formData.maintenanceValidityDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, maintenanceValidityDate: e.target.value }))}
                        className="h-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Non-Aktif fields */}
          {formData.maintenanceStatus === "NON_AKTIF" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data SIMAK</Label>
                <div className="space-y-2">
                  {INACTIVE_SIMAK_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.inactiveSimakData.includes(option)}
                        onChange={(e) => handleSimakChange(option, e.target.checked)}
                        className="rounded"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inactiveSimakInstitution">Aset terdaftar pada SIMAK instansi/lembaga berikut</Label>
                <Input
                  id="inactiveSimakInstitution"
                  value={formData.inactiveSimakInstitution}
                  onChange={(e) => setFormData(prev => ({ ...prev, inactiveSimakInstitution: e.target.value }))}
                  placeholder="Masukkan nama instansi/lembaga"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inactiveReason">Alasan mengapa aset sudah tidak</Label>
                <Textarea
                  id="inactiveReason"
                  value={formData.inactiveReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, inactiveReason: e.target.value }))}
                  placeholder="Jelaskan alasan mengapa aset sudah tidak aktif"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6 md:pt-8">
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 md:h-14 text-base md:text-lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Aset'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
