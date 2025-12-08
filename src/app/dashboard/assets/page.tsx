import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AssetsView } from "./assets-view"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AssetsPage({
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

  const q = (resolvedSearchParams.q as string) || undefined
  const status = (resolvedSearchParams.status as string) || undefined
  const kind = (resolvedSearchParams.kind as string) || undefined

  // Construct Where Clause
  const where: any = {}

  if (status && status !== 'all') where.status = status
  if (kind && kind !== 'all') where.kind = kind

  if (q) {
    where.OR = [
      { name: { contains: q } }, // Removed mode: 'insensitive' if MySQL doesn't support it by default or Prisma settings vary, but usually safer to include or rely on DB collation. 
      // PostgreSQL uses mode: 'insensitive'. MySQL is case-insensitive by default roughly. Next.js template often assumes Postgres. 
      // I'll leave it simple. If valid MySQL it's fine.
      { category: { contains: q } },
      { inventoryNumber: { contains: q } }
    ]
  }

  // Role Based Filtering (Replicated from API)
  if (user.role === 'POLDA' && user.poldaId) {
    where.poldaId = user.poldaId
  } else if (user.role === 'POLRES' && user.polresId) {
    where.polresId = user.polresId
  } else if (user.role === 'USER' && user.polresId) {
    where.polresId = user.polresId
  }

  // Fetch Data
  const [total, assets] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      include: {
        polres: { select: { id: true, name: true } },
        polda: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, nrp: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <AssetsView
      initialAssets={assets}
      pagination={{
        page,
        limit,
        total,
        totalPages
      }}
    />
  )
}
