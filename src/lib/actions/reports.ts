"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createReport(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const polresId = formData.get("polresId") as string
    const userId = formData.get("userId") as string
    const type = formData.get("type") as string || "GENERAL"
    const description = formData.get("description") as string || content

    if (!title || !content || !polresId || !userId) {
      return { error: "Semua field harus diisi" }
    }

    await prisma.report.create({
      data: {
        title,
        content,
        polresId,
        userId,
        type: type as any,
        description
      }
    })

    revalidatePath("/dashboard/reports")
    return { success: "Laporan berhasil dibuat" }
  } catch (error) {
    console.error("Create report error:", error)
    return { error: "Terjadi kesalahan saat membuat laporan" }
  }
}

export async function updateReport(reportId: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const content = formData.get("content") as string

    if (!title || !content) {
      return { error: "Judul dan konten harus diisi" }
    }

    await prisma.report.update({
      where: { id: reportId },
      data: {
        title,
        content
      }
    })

    revalidatePath("/dashboard/reports")
    return { success: "Laporan berhasil diperbarui" }
  } catch (error) {
    console.error("Update report error:", error)
    return { error: "Terjadi kesalahan saat memperbarui laporan" }
  }
}

export async function deleteReport(reportId: string) {
  try {
    await prisma.report.delete({
      where: { id: reportId }
    })

    revalidatePath("/dashboard/reports")
    return { success: "Laporan berhasil dihapus" }
  } catch (error) {
    console.error("Delete report error:", error)
    return { error: "Terjadi kesalahan saat menghapus laporan" }
  }
}

export async function getReports(polresId?: string) {
  try {
    const where = polresId ? { polresId } : {}
    
    const reports = await prisma.report.findMany({
      where,
      include: {
        polres: true,
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

    return { reports }
  } catch (error) {
    console.error("Get reports error:", error)
    return { error: "Terjadi kesalahan saat mengambil data laporan" }
  }
}
