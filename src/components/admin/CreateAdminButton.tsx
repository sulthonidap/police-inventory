"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Shield, Plus, Loader2 } from "lucide-react"

interface CreateAdminButtonProps {
  onSuccess?: () => void
}

export function CreateAdminButton({ onSuccess }: CreateAdminButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nrp: "",
    secretKey: "admin-setup-2024"
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/setup-minimal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "✅ Admin Created Successfully!",
          description: `Admin "${result.user.name}" berhasil dibuat dan langsung di-approve.`,
        })
        
        setFormData({
          name: "",
          email: "",
          password: "",
          nrp: "",
          secretKey: "admin-setup-2024"
        })
        setOpen(false)
        onSuccess?.()
      } else {
        toast({
          title: "❌ Error Creating Admin",
          description: result.error || "Terjadi kesalahan saat membuat admin",
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
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="modern-button">
          <Plus className="w-4 h-4 mr-2" />
          Create Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Create New Admin User
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter admin name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@polri.go.id"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nrp">NRP</Label>
            <Input
              id="nrp"
              type="text"
              placeholder="ADMIN001"
              value={formData.nrp}
              onChange={(e) => handleInputChange("nrp", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="admin123456"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="admin-setup-2024"
              value={formData.secretKey}
              onChange={(e) => handleInputChange("secretKey", e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="modern-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Create Admin
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium text-blue-800 mb-1">ℹ️ Info:</p>
          <ul className="space-y-1 text-blue-700">
            <li>• Admin akan langsung di-approve (status: APPROVED)</li>
            <li>• Role akan otomatis set ke ADMIN</li>
            <li>• Password minimal 8 karakter</li>
            <li>• Email dan NRP harus unik</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
