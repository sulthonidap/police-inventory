"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Shield, Bell, Palette } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@police-inventory.com",
    nrp: "123456789",
    role: "ADMIN"
  })

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle profile update
    console.log("Profile updated:", profile)
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password change
    console.log("Password changed:", password)
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-purple-100 text-purple-800',
      'KORLANTAS': 'bg-blue-100 text-blue-800',
      'POLDA': 'bg-indigo-100 text-indigo-800',
      'POLRES': 'bg-cyan-100 text-cyan-800',
      'USER': 'bg-gray-100 text-gray-800'
    }
    return <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan akun dan sistem</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nrp">NRP</Label>
                  <Input
                    id="nrp"
                    value={profile.nrp}
                    onChange={(e) => setProfile({ ...profile, nrp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="pt-2">
                    {getRoleBadge(profile.role)}
                  </div>
                </div>
              </div>
              <Button type="submit">Simpan Perubahan</Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={password.current}
                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password.new}
                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit">Ubah Password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifikasi</h4>
                  <p className="text-sm text-muted-foreground">Terima notifikasi via email</p>
                </div>
                <Button variant="outline" size="sm">Aktifkan</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notifikasi Sistem</h4>
                  <p className="text-sm text-muted-foreground">Notifikasi untuk aktivitas sistem</p>
                </div>
                <Button variant="outline" size="sm">Aktifkan</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mode Gelap</h4>
                  <p className="text-sm text-muted-foreground">Aktifkan tema gelap</p>
                </div>
                <Button variant="outline" size="sm">Aktifkan</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Kompak Layout</h4>
                  <p className="text-sm text-muted-foreground">Tampilan yang lebih kompak</p>
                </div>
                <Button variant="outline" size="sm">Aktifkan</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
