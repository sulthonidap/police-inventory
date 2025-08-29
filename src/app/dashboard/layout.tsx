"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { LoadingBar } from "@/components/ui/loading-bar"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useAuth(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const handleMenuClick = useCallback(() => {
    setSidebarOpen(true)
  }, [])

  const handleSidebarCollapsedChange = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <LoadingBar />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={handleSidebarClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
      `}>
        <Sidebar 
          onClose={handleSidebarClose} 
          collapsed={sidebarCollapsed}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          onMenuClick={handleMenuClick} 
          sidebarCollapsed={sidebarCollapsed}
          onSidebarCollapsedChange={handleSidebarCollapsedChange}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  )
}
