"use client"

import { useAuth } from "@/hooks/use-auth"
import { ReactNode } from "react"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { hasPermission, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasPermission(allowedRoles)) {
    return fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Akses Ditolak
          </h3>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN"]} fallback={fallback}>{children}</RoleGuard>
}

export function KorlantasOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN", "KORLANTAS"]} fallback={fallback}>{children}</RoleGuard>
}

export function PoldaOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN", "KORLANTAS", "POLDA"]} fallback={fallback}>{children}</RoleGuard>
}

export function PolresOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN", "KORLANTAS", "POLDA", "POLRES"]} fallback={fallback}>{children}</RoleGuard>
}
