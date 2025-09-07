import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      accountType: string
      polresId: string | null
      poldaId: string | null
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    accountType: string
    polresId: string | null
    poldaId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    accountType: string
    polresId: string | null
    poldaId: string | null
  }
}
