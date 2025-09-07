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
  const [filteredPolres, setFilteredPolres] = useState<Polres[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchPoldas()
    fetchPolres()
  }, [])

  useEffect(() => {
    if (formData.operationalRegionId) {
      const filtered = polres.filter(p => p.poldaId === formData.operationalRegionId)
      setFilteredPolres(filtered)
    } else {
      setFilteredPolres([])
    }
  }, [formData.operationalRegionId, polres])

  const fetchPoldas = async () => {
    try {
      const response = await fetch('/api/polda/simple')
      const data = await response.json()
      if (data.poldas) {
        setPoldas(data.poldas)
      }
    } catch (error) {
      console.error('Error fetching poldas:', error)
    }
  }

  const fetchPolres = async () => {
    try {
      const response = await fetch('/api/polres/simple')
      const data = await response.json()
      if (data.polres) {
        setPolres(data.polres)
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Identitas Aset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            1. Identitas Aset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Aset *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama aset"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventoryNumber">No. Inventaris *</Label>
              <Input
                id="inventoryNumber"
                value={formData.inventoryNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, inventoryNumber: e.target.value }))}
                placeholder="Masukkan nomor inventaris"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Jenis Aset *</Label>
              <Select value={formData.kind} onValueChange={(value) => setFormData(prev => ({ ...prev, kind: value, categoryLevel1: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis aset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIGITAL_IT">Digital (IT)</SelectItem>
                  <SelectItem value="BARANG">Barang</SelectItem>
                  <SelectItem value="JASA">Jasa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryLevel1">Kategori Aset *</Label>
              <Select value={formData.categoryLevel1} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryLevel1: value }))}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Section 2: Identitas Aset (Wilayah) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            2. Identitas Aset (Wilayah)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pilih wilayah sumber aset yang akan didaftarkan (bisa sama dengan lokasi operasional aset)</Label>
            <div className="space-y-2">
              <Label htmlFor="sourceRegion">Wilayah sumber *</Label>
              <Select value={formData.sourceRegionId} onValueChange={(value) => setFormData(prev => ({ ...prev, sourceRegionId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Dropdown Wilayah Korlantas dan polda" />
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
          </div>

          <div className="space-y-2">
            <Label>Pilih wilayah operasional aset yang akan didaftarkan (bisa sama dengan wilayah sumber aset)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operationalRegion">Wilayah Operasional *</Label>
                <Select value={formData.operationalRegionId} onValueChange={(value) => setFormData(prev => ({ ...prev, operationalRegionId: value, polresId: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dropdown Wilayah Korlantas dan polda" />
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
                <Label htmlFor="polres">Pilih polres *</Label>
                <Select value={formData.polresId} onValueChange={(value) => setFormData(prev => ({ ...prev, polresId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dropdown Pilih Polres" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPolres.map((polres) => (
                      <SelectItem key={polres.id} value={polres.id}>
                        {polres.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationDate">Tanggal pendaftaran aset *</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                id="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Data Sumber dan Status Aset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            3. Data Sumber dan Status Aset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Sumber Aset *</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
              <SelectTrigger>
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
                <Label htmlFor="sourceDetail">Asal {formData.source === "PENGADAAN" ? "Pengadaan" : formData.source === "HIBAH" ? "Hibah" : formData.source === "POC" ? "POC" : "Lainnya"} *</Label>
                <Input
                  id="sourceDetail"
                  value={formData.sourceDetail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceDetail: e.target.value }))}
                  placeholder="Masukkan asal sumber"
                  required
                />
              </div>

              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Penanggung jawab {formData.source === "PENGADAAN" ? "Pengadaan" : formData.source === "HIBAH" ? "Hibah" : formData.source === "POC" ? "POC" : "Lainnya"}</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="sourceCompanyName">Nama Perusahaan *</Label>
                  <Input
                    id="sourceCompanyName"
                    value={formData.sourceCompanyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyName: e.target.value }))}
                    placeholder="Masukkan nama perusahaan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceCompanyAddress">Alamat perusahaan</Label>
                  <Input
                    id="sourceCompanyAddress"
                    value={formData.sourceCompanyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyAddress: e.target.value }))}
                    placeholder="Alamat singkat"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyProvince">Propinsi</Label>
                    <Input
                      id="sourceCompanyProvince"
                      value={formData.sourceCompanyProvince}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyProvince: e.target.value }))}
                      placeholder="Propinsi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyRegency">Kabupaten</Label>
                    <Input
                      id="sourceCompanyRegency"
                      value={formData.sourceCompanyRegency}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRegency: e.target.value }))}
                      placeholder="Kabupaten"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyDistrict">Kecamatan</Label>
                    <Input
                      id="sourceCompanyDistrict"
                      value={formData.sourceCompanyDistrict}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyDistrict: e.target.value }))}
                      placeholder="Kecamatan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyVillage">Kelurahan/desa</Label>
                    <Input
                      id="sourceCompanyVillage"
                      value={formData.sourceCompanyVillage}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyVillage: e.target.value }))}
                      placeholder="Kelurahan/desa"
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="font-medium">Perwakilan perusahaan</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyRepName">Nama *</Label>
                    <Input
                      id="sourceCompanyRepName"
                      value={formData.sourceCompanyRepName}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRepName: e.target.value }))}
                      placeholder="Nama perwakilan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyRepEmail">Email</Label>
                    <Input
                      id="sourceCompanyRepEmail"
                      type="email"
                      value={formData.sourceCompanyRepEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRepEmail: e.target.value }))}
                      placeholder="Email perwakilan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sourceCompanyRepPhone">No. telp.</Label>
                    <Input
                      id="sourceCompanyRepPhone"
                      value={formData.sourceCompanyRepPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceCompanyRepPhone: e.target.value }))}
                      placeholder="No. telp perwakilan"
                    />
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </CardContent>
      </Card>

      {/* Section 4: Status Pemeliharaan dan Perawatan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            4. Status Pemeliharaan dan Perawatan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status Pemeliharaan dan Perawatan *</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="maintenanceStatus"
                  value="AKTIF"
                  checked={formData.maintenanceStatus === "AKTIF"}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceStatus: e.target.value }))}
                  className="rounded"
                />
                <span>Aktif</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="maintenanceStatus"
                  value="NON_AKTIF"
                  checked={formData.maintenanceStatus === "NON_AKTIF"}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceStatus: e.target.value }))}
                  className="rounded"
                />
                <span>Non Aktif</span>
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
                <Label htmlFor="maintenanceCompanyName">Nama Perusahaan Pemegang Harwat *</Label>
                <Input
                  id="maintenanceCompanyName"
                  value={formData.maintenanceCompanyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyName: e.target.value }))}
                  placeholder="Masukkan nama perusahaan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceCompanyAddress">Alamat perusahaan</Label>
                <Input
                  id="maintenanceCompanyAddress"
                  value={formData.maintenanceCompanyAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyAddress: e.target.value }))}
                  placeholder="Alamat singkat"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyProvince">Propinsi</Label>
                  <Input
                    id="maintenanceCompanyProvince"
                    value={formData.maintenanceCompanyProvince}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyProvince: e.target.value }))}
                    placeholder="Propinsi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyRegency">Kabupaten</Label>
                  <Input
                    id="maintenanceCompanyRegency"
                    value={formData.maintenanceCompanyRegency}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyRegency: e.target.value }))}
                    placeholder="Kabupaten"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyDistrict">Kecamatan</Label>
                  <Input
                    id="maintenanceCompanyDistrict"
                    value={formData.maintenanceCompanyDistrict}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyDistrict: e.target.value }))}
                    placeholder="Kecamatan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCompanyVillage">Kelurahan/desa</Label>
                  <Input
                    id="maintenanceCompanyVillage"
                    value={formData.maintenanceCompanyVillage}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceCompanyVillage: e.target.value }))}
                    placeholder="Kelurahan/desa"
                  />
                </div>
              </div>

              <Separator />
              <h4 className="font-medium">Perwakilan perusahaan</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceRepName">Nama *</Label>
                  <Input
                    id="maintenanceRepName"
                    value={formData.maintenanceRepName}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceRepName: e.target.value }))}
                    placeholder="Nama perwakilan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceRepEmail">Email</Label>
                  <Input
                    id="maintenanceRepEmail"
                    type="email"
                    value={formData.maintenanceRepEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceRepEmail: e.target.value }))}
                    placeholder="Email perwakilan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceRepPhone">No.telp.</Label>
                  <Input
                    id="maintenanceRepPhone"
                    value={formData.maintenanceRepPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceRepPhone: e.target.value }))}
                    placeholder="No. telp perwakilan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceValidityDate">Tanggal masa berlaku harwat *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <Input
                    id="maintenanceValidityDate"
                    type="date"
                    value={formData.maintenanceValidityDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceValidityDate: e.target.value }))}
                    required
                  />
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
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'SUBMIT'
          )}
        </Button>
      </div>
    </form>
  )
}
