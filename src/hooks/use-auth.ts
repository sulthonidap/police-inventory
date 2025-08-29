import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, requireAuth, router])

  const logout = async () => {
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    })
  }

  const isAdmin = session?.user?.role === "ADMIN"
  const isKorlantas = session?.user?.role === "KORLANTAS"
  const isPolda = session?.user?.role === "POLDA"
  const isPolres = session?.user?.role === "POLRES"
  const isUser = session?.user?.role === "USER"

  const hasPermission = (allowedRoles: string[]) => {
    return session?.user?.role && allowedRoles.includes(session.user.role)
  }

  return {
    session,
    status,
    logout,
    isAdmin,
    isKorlantas,
    isPolda,
    isPolres,
    isUser,
    hasPermission,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated"
  }
}
