"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, FileText, AlertTriangle, CheckCircle, XCircle, Upload, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Asset {
  id: string
  name: string
  inventoryNumber: string
  kind: string
  categoryLevel1: string
  polres?: { 
    name: string
    polda?: { name: string }
  }
}

interface ReportFormData {
  // Step 1: Pilih jenis bantuan
  reportType: string
  
  // Step 2: Search asset (jika diperlukan)
  selectedAsset: Asset | null
  searchQuery: string
  assetKindFilter: string
  assetCategoryFilter: string
  
  // Step 3: Form laporan
  problemType: string
  description: string
  attachments: File[]
}

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => Promise<void>
  isSubmitting?: boolean
}

const REPORT_TYPES = [
  {
    id: "ASSET_OPERATIONAL",
    title: "Tiket Kendala Operasional Aset Korlantas",
    description: "Laporkan masalah terkait operasional aset Korlantas"
  },
  {
    id: "APPLICATION_HELP",
    title: "Tiket bantuan Aplikasi Aset dan Help Desk Korlantas", 
    description: "Bantuan terkait aplikasi aset dan help desk"
  },
  {
    id: "GENERAL_ISSUE",
    title: "Tiket Bantuan Permasalahan Umum",
    description: "Masalah umum lainnya"
  },
  {
    id: "OTHER",
    title: "Lainnya",
    description: "Jenis bantuan lain yang tidak terdaftar"
  }
]

const PROBLEM_TYPES = [
  "Tidak bisa login",
  "Data tidak masuk aplikasi dashboard", 
  "Lokasi submit berbeda dengan lokasi pelanggaran",
  "Aplikasi tidak bisa diakses",
  "Lainnya"
]

const ASSET_KINDS = [
  "DIGITAL_IT",
  "BARANG", 
  "JASA"
]

const ASSET_CATEGORIES = {
  "DIGITAL_IT": [
    "Aplikasi Mobile",
    "Aplikasi Web",
    "Platform",
    "Lainnya"
  ],
  "BARANG": [
    "Peralatan ETLE",
    "Kendaraan", 
    "Senjata",
    "Komputer",
    "Server",
    "Alat komunikasi",
    "Lainnya"
  ],
  "JASA": [
    "Jasa Periklanan",
    "Jasa media dan berita", 
    "Jasa Humas",
    "Lainnya"
  ]
}

export function ReportForm({ onSubmit, isSubmitting = false }: ReportFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: "",
    selectedAsset: null,
    searchQuery: "",
    assetKindFilter: "",
    assetCategoryFilter: "",
    problemType: "",
    description: "",
    attachments: []
  })
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const { toast } = useToast()

  const handleReportTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, reportType: type }))
    
    // Jika bukan asset operational, langsung ke step 3
    if (type !== "ASSET_OPERATIONAL") {
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
    }
  }

  const handleAssetSearch = async () => {
    if (!formData.searchQuery.trim()) {
      setSearchError("Masukkan kata kunci pencarian")
      return
    }

    setIsSearching(true)
    setSearchError("")
    
    try {
      const params = new URLSearchParams({
        q: formData.searchQuery,
        ...(formData.assetKindFilter && { kind: formData.assetKindFilter }),
        ...(formData.assetCategoryFilter && { category: formData.assetCategoryFilter })
      })
      
      const response = await fetch(`/api/assets?${params}`)
      const data = await response.json()
      
      console.log('Search response:', response.status, data)
      
      if (response.ok && data.assets) {
        setSearchResults(data.assets)
        if (data.assets.length === 0) {
          setSearchError("Aset tidak ditemukan")
        }
      } else {
        setSearchError(data.error || "Terjadi kesalahan saat mencari aset")
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError("Terjadi kesalahan saat mencari aset")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAssetSelect = (asset: Asset) => {
    setFormData(prev => ({ ...prev, selectedAsset: asset }))
    setCurrentStep(3)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim laporan",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      reportType: "",
      selectedAsset: null,
      searchQuery: "",
      assetKindFilter: "",
      assetCategoryFilter: "",
      problemType: "",
      description: "",
      attachments: []
    })
    setSearchResults([])
    setSearchError("")
    setCurrentStep(1)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Pilih Jenis Bantuan */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pilih jenis bantuan/tiket:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {REPORT_TYPES.map((type) => (
              <div
                key={type.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleReportTypeSelect(type.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{type.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{type.description}</p>
                  </div>
                  <div className="ml-4">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                      {formData.reportType === type.id && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Search Asset (hanya untuk ASSET_OPERATIONAL) */}
      {currentStep === 2 && formData.reportType === "ASSET_OPERATIONAL" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Asset
            </CardTitle>
            <p className="text-sm text-gray-600">
              User memilih aset yang akan dilaporkan kendalanya melalui fitur search. 
              Fitur search bisa ditambahkan semacam advance search dengan tambahan filter: jenis dan kategori aset.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchQuery">Kata Kunci Pencarian</Label>
                <Input
                  id="searchQuery"
                  value={formData.searchQuery}
                  onChange={(e) => setFormData(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="Masukkan nama atau nomor inventaris"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetKindFilter">Jenis Aset</Label>
                <Select value={formData.assetKindFilter} onValueChange={(value) => setFormData(prev => ({ ...prev, assetKindFilter: value, assetCategoryFilter: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis aset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Jenis</SelectItem>
                    {ASSET_KINDS.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {kind === "DIGITAL_IT" ? "Digital (IT)" : kind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetCategoryFilter">Kategori Aset</Label>
                <Select value={formData.assetCategoryFilter} onValueChange={(value) => setFormData(prev => ({ ...prev, assetCategoryFilter: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Kategori</SelectItem>
                    {formData.assetKindFilter && ASSET_CATEGORIES[formData.assetKindFilter as keyof typeof ASSET_CATEGORIES]?.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleAssetSearch} disabled={isSearching} className="w-full">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Cari Aset
                </>
              )}
            </Button>

            {/* Search Results */}
            {searchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Aset tidak ditemukan</span>
                </div>
                <p className="text-red-600 text-sm mt-2">
                  Aset tidak ditemukan. Anda bisa mendaftarkan aset baru pada link berikut: 
                  <a href="/dashboard/assets" className="underline ml-1">Daftar Aset Baru</a> 
                  atau pilih jenis bantuan lainnya.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="mt-3"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Pilih Jenis Bantuan Lainnya
                </Button>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Hasil Pencarian:</h3>
                {searchResults.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{asset.name}</h4>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p>Nomor inventaris: {asset.inventoryNumber}</p>
                          <p>Jenis Aset: {asset.kind === "DIGITAL_IT" ? "Digital (IT)" : asset.kind}</p>
                          <p>Kategori Aset: {asset.categoryLevel1}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                          {formData.selectedAsset?.id === asset.id && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Asset Confirmation */}
            {formData.selectedAsset && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-600 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Anda akan membuat laporan pada aset dengan:</span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Nomor inventaris: {formData.selectedAsset.inventoryNumber}</p>
                  <p>Jenis Aset: {formData.selectedAsset.kind === "DIGITAL_IT" ? "Digital (IT)" : formData.selectedAsset.kind}</p>
                  <p>Nama Aset: {formData.selectedAsset.name}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="confirm" value="correct" defaultChecked className="rounded" />
                    <span className="text-sm">Benar. Lanjutkan laporan.</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="confirm" value="incorrect" className="rounded" />
                    <span className="text-sm">Salah. Ubah pencarian aset.</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Form Pembuatan Tiket */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Buat Tiket bantuan aset dan help desk Korlantas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pilih Jenis Permasalahan */}
              <div className="space-y-2">
                <Label htmlFor="problemType">Pilih Jenis permasalahan: *</Label>
                <Select value={formData.problemType} onValueChange={(value) => setFormData(prev => ({ ...prev, problemType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis permasalahan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROBLEM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Keterangan Singkat */}
              <div className="space-y-2">
                <Label htmlFor="description">Keterangan singkat kendala yang Anda temukan: *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan kendala yang Anda temukan secara detail..."
                  rows={4}
                  required
                />
              </div>

              {/* Upload Dokumen/Foto/Video */}
              <div className="space-y-2">
                <Label>Upload dokumen/foto/video singkat menggambarkan kendala yang Anda temukan:</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Add File
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG, MP4, AVI, MOV (Max 10MB per file)
                    </p>
                  </div>
                </div>

                {/* File List */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>File yang akan diupload:</Label>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep === 3 && formData.reportType === "ASSET_OPERATIONAL" ? 2 : 1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    'SUBMIT'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
