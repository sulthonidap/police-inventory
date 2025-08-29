import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const runtime = 'nodejs'

function generateRandomPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, status: true } })
    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }
    if (user.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Reset password hanya untuk pengguna yang sudah disetujui' }, { status: 400 })
    }

    const newPlain = generateRandomPassword(10)
    const newHash = await bcrypt.hash(newPlain, 12)

    await prisma.user.update({ where: { id: params.id }, data: { password: newHash } })

    return NextResponse.json({ message: 'Password berhasil direset', password: newPlain })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Gagal reset password' }, { status: 500 })
  }
}
