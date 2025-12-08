import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ReportsView } from "./reports-view"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  const user = session?.user as any

  const resolvedSearchParams = await searchParams
  const page = parseInt((resolvedSearchParams.page as string) || "1")
  const limit = 10
  const skip = (page - 1) * limit

  const search = (resolvedSearchParams.search as string) || undefined
  const status = (resolvedSearchParams.status as string) || undefined
  const type = (resolvedSearchParams.type as string) || undefined

  // Construct Where Clause
  const where: any = {}

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } }
    ]
  }

  if (status && status !== 'all') where.status = status
  if (type && type !== 'all') where.type = type

  // Role Based Filtering (Replicated from API)
  if (user.role === 'POLDA' && user.poldaId) {
    where.poldaId = user.poldaId
  } else if (user.role === 'POLRES' && user.polresId) {
    where.polresId = user.polresId
  } else if (user.role === 'USER' && user.polresId) {
    where.polresId = user.polresId
  }
  // Admin/Korlantas see all

  // Fetch Data
  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      include: {
        user: { select: { name: true, nrp: true } },
        polda: { select: { id: true, name: true } },
        polres: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <ReportsView
      initialReports={reports.map((r: any) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }))}
      pagination={{
        page,
        limit,
        total,
        totalPages
      }}
    />
  )
}
