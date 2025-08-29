"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
    poldaId: "",
    polresId: "",
    reason: ""
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

    if (!formData.nrp.trim()) {
      newErrors.nrp = "NRP harus diisi"
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

    if (!formData.reason.trim()) {
      newErrors.reason = "Alasan registrasi harus diisi"
    }

    // Role-specific validation
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
          poldaId: formData.poldaId || null,
          polresId: formData.polresId || null,
          reason: formData.reason
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
              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="nrp" className="text-sm font-medium text-gray-700">
                    NRP *
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
                </div>
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

              {/* Password */}
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

              {/* Role and Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                  Alasan Registrasi *
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Jelaskan alasan Anda ingin mendaftar ke sistem ini..."
                  rows={3}
                  className={errors.reason ? "border-red-500" : ""}
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm">{errors.reason}</p>
                )}
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
