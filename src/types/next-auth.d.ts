import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      polresId: string | null
      poldaId: string | null
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    polresId: string | null
    poldaId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    polresId: string | null
    poldaId: string | null
  }
}
