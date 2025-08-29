"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const nrp = formData.get("nrp") as string
    const password = formData.get("password") as string
    const polresId = formData.get("polresId") as string

    if (!name || !email || !nrp || !password || !polresId) {
      return { error: "Semua field harus diisi" }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { nrp }
        ]
      }
    })

    if (existingUser) {
      return { error: "Email atau NRP sudah terdaftar" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        nrp,
        password: hashedPassword,
        polresId,
        role: "USER",
        status: "PENDING"
      }
    })

    revalidatePath("/dashboard/users")
    return { success: "Registrasi berhasil. Menunggu persetujuan administrator." }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Terjadi kesalahan saat registrasi" }
  }
}

export async function approveUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "APPROVED" }
    })

    revalidatePath("/dashboard/users")
    return { success: "User berhasil disetujui" }
  } catch (error) {
    console.error("Approval error:", error)
    return { error: "Terjadi kesalahan saat menyetujui user" }
  }
}

export async function rejectUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: "REJECTED" }
    })

    revalidatePath("/dashboard/users")
    return { success: "User berhasil ditolak" }
  } catch (error) {
    console.error("Rejection error:", error)
    return { error: "Terjadi kesalahan saat menolak user" }
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/dashboard/users")
    return { success: "User berhasil dihapus" }
  } catch (error) {
    console.error("Delete error:", error)
    return { error: "Terjadi kesalahan saat menghapus user" }
  }
}
