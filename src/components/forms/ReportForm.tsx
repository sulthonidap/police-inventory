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
import { Loader2, Search, FileText, AlertTriangle, CheckCircle, XCircle, Upload, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
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
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: "",
    selectedAsset: null,
    searchQuery: "",
    assetKindFilter: "all",
    assetCategoryFilter: "all",
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
    
    // Reset asset selection jika bukan asset operational
    if (type !== "ASSET_OPERATIONAL") {
      setFormData(prev => ({ ...prev, selectedAsset: null }))
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
        ...(formData.assetKindFilter && formData.assetKindFilter !== "all" && { kind: formData.assetKindFilter }),
        ...(formData.assetCategoryFilter && formData.assetCategoryFilter !== "all" && { category: formData.assetCategoryFilter })
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
      assetKindFilter: "all",
      assetCategoryFilter: "all",
      problemType: "",
      description: "",
      attachments: []
    })
    setSearchResults([])
    setSearchError("")
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-3">Buat Tiket Bantuan</h2>
          <p className="text-lg text-gray-600">Isi form di bawah ini untuk membuat tiket bantuan</p>
        </div>

        {/* Section Khusus untuk Tiket Kendala Operasional Aset */}
        {formData.reportType === "ASSET_OPERATIONAL" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-1">Tiket Kendala Operasional Aset Korlantas</h3>
            <p className="text-blue-700 text-sm">Laporkan masalah terkait operasional aset Korlantas</p>
          </div>
        )}

        {/* Grid Layout 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kolom Kiri */}
          <div className="space-y-6">
            {/* Jenis Bantuan */}
            <div className="space-y-4">
              <Label htmlFor="reportType" className="text-base font-medium text-gray-700">
                Jenis Bantuan *
              </Label>
              <Select value={formData.reportType} onValueChange={handleReportTypeSelect}>
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Pilih jenis bantuan yang Anda butuhkan" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{type.title}</span>
                        <span className="text-sm text-gray-500 mt-1">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jenis Permasalahan */}
            <div className="space-y-4">
              <Label htmlFor="problemType" className="text-base font-medium text-gray-700">
                Jenis Permasalahan *
              </Label>
              <Select value={formData.problemType} onValueChange={(value) => setFormData(prev => ({ ...prev, problemType: value }))}>
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Pilih jenis permasalahan yang Anda alami" />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="py-3">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-6">
            {/* Asset Search - hanya muncul jika ASSET_OPERATIONAL dipilih */}
            {formData.reportType === "ASSET_OPERATIONAL" && (
              <div className="space-y-6">
                {/* Section Search Asset */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-medium text-gray-700 mb-3">Cari Aset</h4>
                    <p className="text-sm text-gray-500 italic">
                      User memilih aset yang akan dilaporkan kendalanya melalui fitur search. 
                      Fitur search bisa ditambahkan semacam advance search dengan tambahan filter: jenis dan kategori aset.
                    </p>
                  </div>
                
                {/* Search Form */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="searchQuery" className="text-base font-medium text-gray-700">Kata Kunci</Label>
                    <Input
                      id="searchQuery"
                      value={formData.searchQuery}
                      onChange={(e) => setFormData(prev => ({ ...prev, searchQuery: e.target.value }))}
                      placeholder="Nama atau nomor inventaris"
                      className="h-12"
                    />
                  </div>
                  
                </div>

                <Button 
                  type="button"
                  onClick={handleAssetSearch} 
                  disabled={isSearching} 
                  className="w-full h-12"
                >
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
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-semibold">Aset tidak ditemukan</span>
                    </div>
                    <p className="text-red-600 text-sm mt-2">
                      Aset tidak ditemukan. Anda bisa mendaftarkan aset baru pada 
                      <a href="/dashboard/assets" className="underline ml-1 font-medium">Daftar Aset Baru</a> 
                      atau pilih jenis bantuan lainnya.
                    </p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-3 mt-4 max-h-40 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-gray-700">Hasil Pencarian:</h4>
                    {searchResults.map((asset) => (
                      <div
                        key={asset.id}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                        onClick={() => handleAssetSelect(asset)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{asset.name}</h5>
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                              <p>No. Inventaris: <span className="font-medium">{asset.inventoryNumber}</span></p>
                              <p>Jenis: <span className="font-medium">{asset.kind === "DIGITAL_IT" ? "Digital (IT)" : asset.kind}</span></p>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
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

                {/* Selected Asset Confirmation */}
                {formData.selectedAsset && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
                    <div className="flex items-center gap-2 text-green-600 mb-3">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Aset Terpilih:</span>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><strong>Nama:</strong> {formData.selectedAsset.name}</p>
                      <p><strong>No. Inventaris:</strong> {formData.selectedAsset.inventoryNumber}</p>
                      <p><strong>Jenis:</strong> {formData.selectedAsset.kind === "DIGITAL_IT" ? "Digital (IT)" : formData.selectedAsset.kind}</p>
                    </div>
                  </div>
                )}
                </div>

                {/* Section Tidak Menemukan Aset */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tidak menemukan aset?</h4>
                  <p className="text-sm text-gray-600">
                    Anda bisa mendaftarkan aset baru pada link berikut: 
                    <a 
                      href="/dashboard/assets" 
                      className="text-blue-600 hover:text-blue-800 underline ml-1"
                    >
                      Tambahkan aset baru
                    </a>
                    , atau pilih jenis bantuan lainnya.
                  </p>
                </div>
              </div>
            )}

            {/* Upload Dokumen */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-gray-700">
                Lampiran (Opsional)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-base font-medium text-gray-900">
                      Upload File
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
                  <p className="text-sm text-gray-500 mt-3">
                    PDF, DOC, DOCX, JPG, PNG, MP4, AVI, MOV (Max 10MB per file)
                  </p>
                </div>
              </div>

              {/* File List */}
              {formData.attachments.length > 0 && (
                <div className="space-y-3 mt-4 max-h-32 overflow-y-auto">
                  <Label className="text-sm font-semibold text-gray-700">File yang akan diupload:</Label>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <span className="truncate text-sm font-medium">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-8 w-8 p-0 flex-shrink-0 hover:bg-red-100"
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deskripsi Masalah - Full Width */}
        <div className="space-y-4">
          <Label htmlFor="description" className="text-base font-medium text-gray-700">
            Deskripsi Masalah *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Jelaskan secara detail masalah yang Anda alami..."
            rows={5}
            className="resize-none text-base"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.reportType || !formData.problemType || !formData.description || (formData.reportType === "ASSET_OPERATIONAL" && !formData.selectedAsset)} 
            className="w-full h-14 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim Tiket...
              </>
            ) : (
              'Kirim Tiket Bantuan'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
