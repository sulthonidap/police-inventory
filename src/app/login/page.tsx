"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Shield, Eye, EyeOff, AlertCircle, Plus, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
        toast({
          title: "Login Gagal",
          description: "Email atau password yang Anda masukkan salah.",
          variant: "destructive",
        })
      } else {
        // Check if user is authenticated
        const session = await getSession()
        if (session) {
          toast({
            title: "Login Berhasil",
            description: "Selamat datang kembali!",
          })
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan saat login")
      toast({
        title: "Login Gagal",
        description: "Terjadi kesalahan saat memproses login.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAdmin = async () => {
    setCreatingAdmin(true)
    
    try {
      const adminData = {
        name: "Test Admin",
        email: `test-admin-${Date.now()}@polri.go.id`,
        password: "admin123456",
        nrp: `TEST${Date.now()}`,
        secretKey: "admin-setup-2024"
      }

      const response = await fetch('/api/admin/setup-minimal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Admin Created!",
          description: `Admin berhasil dibuat! Email: ${result.user.email}`,
        })
        
        // Auto-fill login form
        setFormData({
          email: result.user.email,
          password: "admin123456"
        })
      } else {
        toast({
          title: "❌ Error",
          description: result.error || "Gagal membuat admin",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "❌ Network Error",
        description: "Gagal terhubung ke server",
        variant: "destructive"
      })
    } finally {
      setCreatingAdmin(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang
          </h1>
          <p className="text-gray-600">
            Masuk ke sistem inventaris Korlantas
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email Anda"
                  className="h-12 text-base"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan password Anda"
                    className="h-12 text-base pr-12"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Ingat saya
                  </Label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Lupa password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            {/* Divider */}
            

            {/* Test Admin Button */}
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateAdmin}
                disabled={creatingAdmin}
                className="w-full h-10 text-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                {creatingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    🚀 Create Test Admin (Auto Login)
                  </>
                )}
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Existing Admin Credentials */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🔑 Existing Admin Credentials</h3>
            <div className="space-y-1 text-xs text-blue-700">
              <p><strong>Email:</strong> prod@polri.go.id</p>
              <p><strong>Password:</strong> admin123456</p>
              <p className="text-blue-600 mt-2">💡 Click "Create Test Admin" for instant access!</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            &copy; 2025 Inventory System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
