"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createAsset(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const polresId = formData.get("polresId") as string
    const assignedTo = formData.get("assignedTo") as string || null

    if (!name || !category || !polresId) {
      return { error: "Nama, kategori, dan Polres harus diisi" }
    }

    await prisma.asset.create({
      data: {
        name,
        category: category as any,
        polresId,
        assignedTo,
        status: "ACTIVE"
      }
    })

    revalidatePath("/dashboard/assets")
    return { success: "Asset berhasil ditambahkan" }
  } catch (error) {
    console.error("Create asset error:", error)
    return { error: "Terjadi kesalahan saat menambahkan asset" }
  }
}

export async function updateAsset(assetId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const status = formData.get("status") as string
    const assignedTo = formData.get("assignedTo") as string || null

    if (!name || !category || !status) {
      return { error: "Nama, kategori, dan status harus diisi" }
    }

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        name,
        category: category as any,
        status: status as any,
        assignedTo
      }
    })

    revalidatePath("/dashboard/assets")
    return { success: "Asset berhasil diperbarui" }
  } catch (error) {
    console.error("Update asset error:", error)
    return { error: "Terjadi kesalahan saat memperbarui asset" }
  }
}

export async function deleteAsset(assetId: string) {
  try {
    await prisma.asset.delete({
      where: { id: assetId }
    })

    revalidatePath("/dashboard/assets")
    return { success: "Asset berhasil dihapus" }
  } catch (error) {
    console.error("Delete asset error:", error)
    return { error: "Terjadi kesalahan saat menghapus asset" }
  }
}

export async function getAssets(polresId?: string) {
  try {
    const where = polresId ? { polresId } : {}
    
    const assets = await prisma.asset.findMany({
      where,
      include: {
        polres: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            nrp: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return { assets }
  } catch (error) {
    console.error("Get assets error:", error)
    return { error: "Terjadi kesalahan saat mengambil data asset" }
  }
}
