"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle, AlertCircle, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Polda {
  id: string
  name: string
}

interface Polres {
  id: string
  name: string
  poldaId: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nrp: "",
    password: "",
    confirmPassword: "",
    role: "",
    accountType: "",
    poldaId: "",
    polresId: "",
    reason: "",
    // Fields khusus untuk pihak ketiga
    companyName: "",
    phone: "",
    assetTypes: [] as string[],
    otherAssetType: "",
    region: "",
    satwil: "",
    // Fields khusus untuk anggota
    pangkat: "",
    jabatan: "",
    isEtleOperator: false,
    etleOperatorTypes: [] as string[]
  })
  
  const [poldas, setPoldas] = useState<Polda[]>([])
  const [polres, setPolres] = useState<Polres[]>([])
  const [filteredPolres, setFilteredPolres] = useState<Polres[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { toast } = useToast()

  // Fetch Polda and Polres data on component mount
  useEffect(() => {
    fetchPoldas()
    fetchPolres()
  }, [])

  // Update filteredPolres when polres data is loaded and poldaId is selected
  useEffect(() => {
    if (formData.poldaId && polres.length > 0) {
      const filtered = polres.filter(polres => polres.poldaId === formData.poldaId)
      setFilteredPolres(filtered)
    }
  }, [polres, formData.poldaId])

  const fetchPoldas = async () => {
    try {
      const response = await fetch('/api/polda/simple')
      if (response.ok) {
        const data = await response.json()
        setPoldas(data)
      }
    } catch (error) {
      console.error('Error fetching poldas:', error)
    }
  }

  const fetchPolres = async () => {
    try {
      const response = await fetch('/api/polres/simple')
      if (response.ok) {
        const data = await response.json()
        setPolres(data)
      }
    } catch (error) {
      console.error('Error fetching polres:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
    }

    if (!formData.nrp.trim() && formData.accountType === "ANGGOTA") {
      newErrors.nrp = "NRP harus diisi untuk anggota"
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok"
    }

    if (!formData.role) {
      newErrors.role = "Role harus dipilih"
    }

    if (!formData.accountType) {
      newErrors.accountType = "Jenis akun harus dipilih"
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Alasan registrasi harus diisi"
    }

    // Validasi khusus untuk pihak ketiga
    if (formData.accountType === "PIHAK_KETIGA") {
      if (!formData.companyName.trim()) {
        newErrors.companyName = "Nama perusahaan harus diisi"
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Nomor telepon harus diisi"
      }
      if (formData.assetTypes.length === 0) {
        newErrors.assetTypes = "Pilih minimal satu jenis aset"
      }
      if (!formData.region) {
        newErrors.region = "Wilayah harus dipilih"
      }
      if (!formData.satwil) {
        newErrors.satwil = "Satwil harus dipilih"
      }
    }

    // Validasi khusus untuk anggota
    if (formData.accountType === "ANGGOTA") {
      if (!formData.pangkat.trim()) {
        newErrors.pangkat = "Pangkat harus diisi"
      }
      if (!formData.jabatan.trim()) {
        newErrors.jabatan = "Jabatan harus diisi"
      }
      // Validasi khusus untuk operator ETLE
      if (formData.isEtleOperator && formData.etleOperatorTypes.length === 0) {
        newErrors.etleOperatorTypes = "Pilih minimal satu jenis operator ETLE"
      }
    }

    // Role-specific validation (hanya untuk anggota)
    if (formData.accountType === "ANGGOTA") {
      if (formData.role === "USER" || formData.role === "POLDA") {
        if (!formData.poldaId) {
          newErrors.poldaId = "Polda harus dipilih"
        }
      }

      if (formData.role === "USER") {
        if (!formData.polresId) {
          newErrors.polresId = "Polres harus dipilih"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAccountTypeChange = (accountType: string) => {
    setFormData(prev => ({ 
      ...prev, 
      accountType,
      // Set role otomatis berdasarkan jenis akun
      role: accountType === "PIHAK_KETIGA" ? "TEKNISI" : prev.role,
      // Reset NRP for non-anggota accounts
      nrp: accountType === "PIHAK_KETIGA" ? `EXT-${Date.now()}` : prev.nrp,
      // Reset fields khusus pihak ketiga jika bukan pihak ketiga
      companyName: accountType === "PIHAK_KETIGA" ? prev.companyName : "",
      phone: accountType === "PIHAK_KETIGA" ? prev.phone : "",
      assetTypes: accountType === "PIHAK_KETIGA" ? prev.assetTypes : [],
      otherAssetType: accountType === "PIHAK_KETIGA" ? prev.otherAssetType : "",
      region: accountType === "PIHAK_KETIGA" ? prev.region : "",
      satwil: accountType === "PIHAK_KETIGA" ? prev.satwil : ""
    }))
  }

  const handleAssetTypeChange = (assetType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assetTypes: checked
        ? [...prev.assetTypes, assetType]
        : prev.assetTypes.filter(type => type !== assetType)
    }))
  }

  const handleEtleOperatorTypeChange = (operatorType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      etleOperatorTypes: checked
        ? [...prev.etleOperatorTypes, operatorType]
        : prev.etleOperatorTypes.filter(type => type !== operatorType)
    }))
  }

  const handlePoldaChange = (poldaId: string) => {
    setFormData(prev => ({ ...prev, poldaId, polresId: "" }))
    
    if (poldaId) {
      const filtered = polres.filter(polres => polres.poldaId === poldaId)
      setFilteredPolres(filtered)
    } else {
      setFilteredPolres([])
    }
  }

  const handleRegionChange = (regionId: string) => {
    setFormData(prev => ({ ...prev, region: regionId, satwil: "" }))
    
    if (regionId) {
      const filtered = polres.filter(polres => polres.poldaId === regionId)
      setFilteredPolres(filtered)
    } else {
      setFilteredPolres([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          nrp: formData.nrp,
          password: formData.password,
          role: formData.role,
          accountType: formData.accountType,
          poldaId: formData.accountType === "PIHAK_KETIGA" ? formData.region : (formData.poldaId || null),
          polresId: formData.accountType === "PIHAK_KETIGA" ? formData.satwil : (formData.polresId || null),
          reason: formData.reason,
          // Data khusus pihak ketiga
          companyName: formData.companyName || null,
          phone: formData.phone || null,
          assetTypes: formData.assetTypes.length > 0 ? formData.assetTypes : null,
          otherAssetType: formData.otherAssetType || null,
          region: formData.region || null,
          satwil: formData.satwil || null,
          // Data khusus anggota
          pangkat: formData.pangkat || null,
          jabatan: formData.jabatan || null,
          isEtleOperator: formData.isEtleOperator,
          etleOperatorTypes: formData.etleOperatorTypes.length > 0 ? formData.etleOperatorTypes : null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: "Registrasi Berhasil",
          description: "Akun Anda telah berhasil didaftarkan dan menunggu persetujuan admin.",
        })
      } else {
        toast({
          title: "Registrasi Gagal",
          description: data.error || "Terjadi kesalahan saat mendaftar",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registrasi Gagal",
        description: "Terjadi kesalahan saat mendaftar",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Registrasi Berhasil!
              </h2>
              <p className="text-gray-600 mb-8">
                Akun Anda telah berhasil didaftarkan dan sedang menunggu persetujuan dari admin. 
                Anda akan menerima email notifikasi setelah akun disetujui.
              </p>
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Kembali ke Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrasi Akun
          </h1>
          <p className="text-gray-600">
            Daftar akun baru untuk mengakses sistem inventaris Korlantas
          </p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Type Selection - Paling Atas */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Pilih Jenis Akun
                    </h3>
                    <p className="text-sm text-gray-600">
                      Pilih jenis akun yang sesuai dengan peran Anda
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.accountType === "ANGGOTA" 
                          ? "border-blue-500 bg-blue-50 shadow-md" 
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                      onClick={() => handleAccountTypeChange("ANGGOTA")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.accountType === "ANGGOTA" 
                            ? "border-blue-500 bg-blue-500" 
                            : "border-gray-300"
                        }`}>
                          {formData.accountType === "ANGGOTA" && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Anggota</h4>
                          <p className="text-sm text-gray-600">Untuk anggota internal organisasi</p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.accountType === "PIHAK_KETIGA" 
                          ? "border-blue-500 bg-blue-50 shadow-md" 
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                      onClick={() => handleAccountTypeChange("PIHAK_KETIGA")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.accountType === "PIHAK_KETIGA" 
                            ? "border-blue-500 bg-blue-500" 
                            : "border-gray-300"
                        }`}>
                          {formData.accountType === "PIHAK_KETIGA" && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Pihak Ketiga/Tim Teknis</h4>
                          <p className="text-sm text-gray-600">Untuk eksternal dan tim teknis</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {errors.accountType && (
                    <p className="text-red-500 text-sm text-center">{errors.accountType}</p>
                  )}
                </div>
              </div>

              {/* Form hanya muncul setelah jenis akun dipilih */}
              {formData.accountType && (
                <>
                  {/* Personal Information */}
                  <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Informasi Personal</h3>
                  <p className="text-sm text-gray-600">Data diri dan kontak</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                
                {formData.accountType === "ANGGOTA" && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nrp" className="text-sm font-medium text-gray-700">
                          NRP (Nomor Registrasi Pegawai) *
                        </Label>
                        <Input
                          id="nrp"
                          type="text"
                          value={formData.nrp}
                          onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                          placeholder="Masukkan NRP"
                          className={errors.nrp ? "border-red-500" : ""}
                        />
                        {errors.nrp && (
                          <p className="text-red-500 text-sm">{errors.nrp}</p>
                        )}
                        <p className="text-xs text-green-600">
                          NRP diperlukan untuk verifikasi keanggotaan
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pangkat" className="text-sm font-medium text-gray-700">
                            Pangkat *
                          </Label>
                          <Input
                            id="pangkat"
                            type="text"
                            value={formData.pangkat}
                            onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
                            placeholder="Masukkan pangkat"
                            className={errors.pangkat ? "border-red-500" : ""}
                          />
                          {errors.pangkat && (
                            <p className="text-red-500 text-sm">{errors.pangkat}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="jabatan" className="text-sm font-medium text-gray-700">
                            Jabatan *
                          </Label>
                          <Input
                            id="jabatan"
                            type="text"
                            value={formData.jabatan}
                            onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                            placeholder="Masukkan jabatan"
                            className={errors.jabatan ? "border-red-500" : ""}
                          />
                          {errors.jabatan && (
                            <p className="text-red-500 text-sm">{errors.jabatan}</p>
                          )}
                        </div>
                      </div>

                      {/* Pertanyaan ETLE Operator */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Apakah Anda Operator Aplikasi ETLE? *
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="etle-yes"
                              name="isEtleOperator"
                              checked={formData.isEtleOperator === true}
                              onChange={() => setFormData({ ...formData, isEtleOperator: true })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <Label htmlFor="etle-yes" className="text-sm text-gray-700">
                              Ya
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="etle-no"
                              name="isEtleOperator"
                              checked={formData.isEtleOperator === false}
                              onChange={() => setFormData({ ...formData, isEtleOperator: false })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <Label htmlFor="etle-no" className="text-sm text-gray-700">
                              Tidak
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Form Data Operator ETLE - hanya muncul jika memilih Ya */}
                      {formData.isEtleOperator && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mt-4">
                          <div className="space-y-4">
                            <div className="text-center">
                              <h4 className="text-lg font-semibold text-purple-800 mb-2">
                                Data operator ETLE
                              </h4>
                              <p className="text-sm text-purple-600">
                                Pilih jenis operator ETLE yang sesuai dengan peran Anda
                              </p>
                            </div>
                            
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">
                                Pilih Operator di bawah ini *
                              </Label>
                              
                              <div className="space-y-3">
                                {[
                                  "Operator Back Office ETLE",
                                  "Operator Front Office ETLE", 
                                  "Operator ETLE Mobile Handheld"
                                ].map((operatorType) => (
                                  <div key={operatorType} className="flex items-center space-x-3">
                                    <Checkbox
                                      id={`etle-${operatorType}`}
                                      checked={formData.etleOperatorTypes.includes(operatorType)}
                                      onCheckedChange={(checked: boolean) => 
                                        handleEtleOperatorTypeChange(operatorType, checked)
                                      }
                                    />
                                    <Label 
                                      htmlFor={`etle-${operatorType}`} 
                                      className="text-sm text-gray-700 cursor-pointer"
                                    >
                                      {operatorType}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              
                              {errors.etleOperatorTypes && (
                                <p className="text-red-500 text-sm">{errors.etleOperatorTypes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Fields khusus untuk pihak ketiga */}
              {formData.accountType === "PIHAK_KETIGA" && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      Informasi Pihak Ketiga
                    </h3>
                    <p className="text-sm text-orange-600">
                      Lengkapi informasi perusahaan dan jenis aset yang akan dikelola
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                      Nama Perusahaan *
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Masukkan nama perusahaan"
                      className={errors.companyName ? "border-red-500" : ""}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm">{errors.companyName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      No. Telp. *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Masukkan nomor telepon"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">{errors.phone}</p>
                    )}
                  </div>

                  {/* Checkbox untuk jenis aset */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Pihak ketiga sebagai PIC untuk Aset Korlantas sebagai berikut *
                    </Label>
                    <div className="space-y-2">
                      {[
                        "STLE Statis",
                        "ETLE Portable", 
                        "ETLE Mobile Handheld",
                        "STLE Mobile On-Board"
                      ].map((assetType) => (
                        <div key={assetType} className="flex items-center space-x-2">
                          <Checkbox
                            id={assetType}
                            checked={formData.assetTypes.includes(assetType)}
                            onCheckedChange={(checked: boolean) => 
                              handleAssetTypeChange(assetType, checked)
                            }
                          />
                          <Label htmlFor={assetType} className="text-sm text-gray-700">
                            {assetType}
                          </Label>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other"
                          checked={formData.assetTypes.includes("Yang lain")}
                          onCheckedChange={(checked: boolean) => 
                            handleAssetTypeChange("Yang lain", checked)
                          }
                        />
                        <Label htmlFor="other" className="text-sm text-gray-700">
                          Yang lain:
                        </Label>
                      </div>
                      
                      {formData.assetTypes.includes("Yang lain") && (
                        <div className="ml-6">
                          <Input
                            type="text"
                            value={formData.otherAssetType}
                            onChange={(e) => setFormData({ ...formData, otherAssetType: e.target.value })}
                            placeholder="Jawaban Anda"
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>
                    {errors.assetTypes && (
                      <p className="text-red-500 text-sm">{errors.assetTypes}</p>
                    )}
                  </div>

                  {/* Dropdown wilayah dan satwil */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                        Permohonan  ke wilayah *
                      </Label>
                      <Select value={formData.region} onValueChange={handleRegionChange}>
                        <SelectTrigger className={errors.region ? "border-red-500" : ""}>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {poldas.map((polda) => (
                            <SelectItem key={polda.id} value={polda.id}>
                              {polda.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.region && (
                        <p className="text-red-500 text-sm">{errors.region}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="satwil" className="text-sm font-medium text-gray-700">
                        Satwil? *
                      </Label>
                      <Select 
                        value={formData.satwil} 
                        onValueChange={(value) => setFormData({ ...formData, satwil: value })}
                        disabled={!formData.region}
                      >
                        <SelectTrigger className={errors.satwil ? "border-red-500" : ""}>
                          <SelectValue placeholder={formData.region ? "Pilih" : "Pilih wilayah terlebih dahulu"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPolres.map((polres) => (
                            <SelectItem key={polres.id} value={polres.id}>
                              {polres.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.satwil && (
                        <p className="text-red-500 text-sm">{errors.satwil}</p>
                    )}
                  </div>
                </div>
                </div>
              </div>
              )}

              {/* Password */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Keamanan Akun</h3>
                  <p className="text-sm text-gray-600">Buat password yang aman</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className={errors.password ? "border-red-500 pr-12" : "pr-12"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Konfirmasi Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Konfirmasi password"
                        className={errors.confirmPassword ? "border-red-500 pr-12" : "pr-12"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Role dan Organisasi</h3>
                  <p className="text-sm text-gray-600">Pilih peran dan unit kerja</p>
                </div>
                
                {formData.accountType === "PIHAK_KETIGA" ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">T</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Role: Teknisi</h4>
                        <p className="text-sm text-blue-600">Pihak ketiga otomatis mendapat role Teknisi</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Role *
                    </Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="POLDA">Polda</SelectItem>
                        <SelectItem value="POLRES">Polres</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-red-500 text-sm">{errors.role}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Organization Selection - Hanya untuk Anggota */}
              {formData.accountType === "ANGGOTA" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(formData.role === "USER" || formData.role === "POLDA") && (
                      <div className="space-y-2">
                        <Label htmlFor="polda" className="text-sm font-medium text-gray-700">
                          Polda *
                        </Label>
                        <Select value={formData.poldaId} onValueChange={handlePoldaChange}>
                          <SelectTrigger className={errors.poldaId ? "border-red-500" : ""}>
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
                        {errors.poldaId && (
                          <p className="text-red-500 text-sm">{errors.poldaId}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {formData.role === "USER" && (
                    <div className="space-y-2">
                      <Label htmlFor="polres" className="text-sm font-medium text-gray-700">
                        Polres *
                      </Label>
                      <Select 
                        value={formData.polresId} 
                        onValueChange={(value) => setFormData({ ...formData, polresId: value })}
                        disabled={!formData.poldaId}
                      >
                        <SelectTrigger className={errors.polresId ? "border-red-500" : ""}>
                          <SelectValue placeholder={formData.poldaId ? "Pilih Polres" : "Pilih Polda terlebih dahulu"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPolres.map((polres) => (
                            <SelectItem key={polres.id} value={polres.id}>
                              {polres.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.polresId && (
                        <p className="text-red-500 text-sm">{errors.polresId}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Alasan Registrasi</h3>
                  <p className="text-sm text-gray-600">Jelaskan tujuan dan kebutuhan akses</p>
                </div>
                <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  {formData.accountType === "PIHAK_KETIGA" ? "Alasan dan Keterangan *" : "Alasan Registrasi *"}
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder={
                    formData.accountType === "PIHAK_KETIGA" 
                      ? "Jelaskan alasan dan keterangan sebagai pihak ketiga/tim teknis..." 
                      : "Jelaskan alasan Anda ingin mendaftar ke sistem ini..."
                  }
                  rows={3}
                  className={errors.reason ? "border-red-500" : ""}
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm">{errors.reason}</p>
                )}
                {formData.accountType === "PIHAK_KETIGA" && (
                  <p className="text-sm text-gray-500">
                    * Untuk pihak ketiga/tim teknis, harap jelaskan peran dan tanggung jawab Anda dalam sistem ini.
                  </p>
                )}
                </div>
              </div>

                  {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Akun'
                )}
              </Button>
                </>
              )}
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Sudah punya akun?{" "}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
