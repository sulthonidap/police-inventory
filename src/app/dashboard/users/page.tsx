import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UsersView } from "./users-view"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function UsersPage({
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
  const role = (resolvedSearchParams.role as string) || undefined
  const poldaId = (resolvedSearchParams.poldaId as string) || undefined
  const polresId = (resolvedSearchParams.polresId as string) || undefined

  // Construct Where Clause
  const where: any = {}

  if (status && status !== 'ALL') where.status = status
  if (role && role !== 'ALL') where.role = role

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { nrp: { contains: q } },
      { email: { contains: q } }
    ]
  }

  // Filter Logic primarily based on Session role, then by filter params
  if (session.user.role === 'POLDA' && session.user.poldaId) {
    where.polres = { poldaId: session.user.poldaId }
    // Also respect sub-filter if they want to see specific polres in their Polda
    if (polresId && polresId !== 'ALL') where.polres.id = polresId
  } else if (session.user.role === 'POLRES' && session.user.polresId) {
    where.polresId = session.user.polresId
  } else if (session.user.role === 'USER' && session.user.polresId) {
    where.polresId = session.user.polresId
  } else {
    // ADMIN or KORLANTAS: Can filter by anything
    if (poldaId && poldaId !== 'ALL') {
      where.polres = { ...where.polres, poldaId: poldaId }
    }
    if (polresId && polresId !== 'ALL') {
      where.polresId = polresId // More specific
    }
  }

  // Fetch Data
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        polres: {
          select: {
            id: true,
            name: true,
            polda: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <UsersView
      initialUsers={users.map((u: any) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
      pagination={{
        page,
        limit,
        total,
        totalPages
      }}
    />
  )
}
