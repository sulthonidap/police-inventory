"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Ada masalah dengan konfigurasi server. Silakan hubungi administrator."
      case "AccessDenied":
        return "Akses ditolak. Akun Anda mungkin belum disetujui."
      case "Verification":
        return "Link verifikasi tidak valid atau sudah kadaluarsa."
      case "Default":
      default:
        return "Terjadi kesalahan saat autentikasi. Silakan coba lagi."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <CardTitle className="text-2xl">Error Autentikasi</CardTitle>
          </div>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <p>Error Code: {error || "Unknown"}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Link href="/auth/signin">
              <Button className="w-full">
                Coba Login Lagi
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
