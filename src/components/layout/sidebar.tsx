"use client"

import { useState, useMemo, memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePendingUsers } from "@/hooks/use-pending-users"
import { useAuth } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Building,
  Shield,
  Settings,
  X
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    showBadge: true, // Menandakan item ini bisa menampilkan badge
  },
  {
    title: "Assets",
    href: "/dashboard/assets",
    icon: Package,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Polres",
    href: "/dashboard/polres",
    icon: Building,
  },
  {
    title: "Polda",
    href: "/dashboard/polda",
    icon: Shield,
  },
  // {
  //   title: "Settings",
  //   href: "/dashboard/settings",
  //   icon: Settings,
  // },
]

interface SidebarProps {
  onClose?: () => void
  collapsed?: boolean
}

export const Sidebar = memo(function Sidebar({ onClose, collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { pendingCount } = usePendingUsers()
  const { hasPermission } = useAuth()

  // Memoize menu items to prevent unnecessary re-renders
  const menuItemsWithBadge = useMemo(() => {
    return menuItems
      .filter(item => {
        // Filter menu items based on user role
        switch (item.href) {
          case "/dashboard/users":
            return hasPermission(["ADMIN", "KORLANTAS", "POLDA"])
          case "/dashboard/polda":
            return hasPermission(["ADMIN", "KORLANTAS"])
          case "/dashboard/polres":
            return hasPermission(["ADMIN", "KORLANTAS", "POLDA"])
          case "/dashboard/assets":
            return hasPermission(["ADMIN", "KORLANTAS", "POLDA", "POLRES", "USER"])
          case "/dashboard/reports":
            return hasPermission(["ADMIN", "KORLANTAS", "POLDA", "POLRES", "USER"])
          default:
            return true
        }
      })
      .map(item => ({
        ...item,
        showBadge: item.showBadge && pendingCount > 0
      }))
  }, [pendingCount, hasPermission])

  const handleItemClick = () => {
    // Close sidebar on mobile when item is clicked
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className={cn(
      "modern-sidebar h-screen transition-all duration-200 ease-out bg-white shadow-lg",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-blue-100/50">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg gradient-text">Police</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {/* Mobile close button */}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="lg:hidden hover:bg-blue-50/50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItemsWithBadge.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200 group relative",
                  collapsed ? "justify-center px-2 py-2" : "space-x-3 px-2 py-2",
                  isActive
                    ? "bg-blue-600 text-white border border-blue-200"
                    : "text-gray-700 hover:bg-blue-50/80 hover:text-blue-700"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ",
                  isActive
                    ? "bg-white/20 text-white border-white/30"
                    : "text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 border-gray-200 group-hover:border-blue-200",
                  collapsed && !isActive && "bg-gray-50"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                  )} />
                </div>
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="font-medium truncate">{item.title}</span>
                    {item.showBadge && (
                      <Badge
                        className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      >
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </Badge>
                    )}
                  </div>
                )}
                {collapsed && item.showBadge && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-blue-100/50">
            <div className="text-center">
              <p className="text-xs text-gray-500">Police Inventory</p>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
