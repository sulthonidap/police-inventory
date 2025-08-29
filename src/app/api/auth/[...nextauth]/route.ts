import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Konfigurasi untuk Vercel deployment

// Konfigurasi untuk Vercel deployment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 30

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
