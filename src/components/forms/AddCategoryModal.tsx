"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"

interface AddCategoryModalProps {
  onCategoryAdded: (category: { name: string; kind: string; description?: string }) => void
  triggerKind?: string
}

export function AddCategoryModal({ onCategoryAdded, triggerKind }: AddCategoryModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    kind: triggerKind || "",
    description: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.kind) {
      toast({
        title: "Error",
        description: "Nama dan jenis kategori harus diisi",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newCategory = await response.json()
        onCategoryAdded(newCategory)
        
        toast({
          title: "Berhasil",
          description: "Kategori baru berhasil ditambahkan"
        })
        
        setFormData({ name: "", kind: triggerKind || "", description: "" })
        setIsOpen(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Gagal menambahkan kategori baru",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan kategori",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setFormData({ name: "", kind: triggerKind || "", description: "" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Kategori Aset Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kind">Jenis Aset *</Label>
            <Select 
              value={formData.kind} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, kind: value }))}
              disabled={!!triggerKind}
            >
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
            <Label htmlFor="name">Nama Kategori *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masukkan nama kategori baru"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Masukkan deskripsi kategori"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
