"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  LogOut, 
  Settings, 
  Bell,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface NavbarProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
  onSidebarCollapsedChange?: (collapsed: boolean) => void
}

export function Navbar({ onMenuClick, sidebarCollapsed, onSidebarCollapsedChange }: NavbarProps) {
  const { data: session } = useSession()

  const getRoleBadge = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'KORLANTAS': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'POLDA': 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      'POLRES': 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      'USER': 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
    return roleColors[role as keyof typeof roleColors] || 'bg-gradient-to-r from-gray-500 to-gray-600'
  }

  return (
    <div className="modern-navbar h-16 px-4 lg:px-6 flex items-center justify-between bg-white shadow-sm border-b border-gray-200">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-blue-50/50"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        
        {/* Desktop sidebar toggle button */}
        {onSidebarCollapsedChange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSidebarCollapsedChange(!sidebarCollapsed)}
            className="hidden lg:flex hover:bg-blue-50/50"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        )}
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold gradient-text">Police Inventory</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-blue-100/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Mobile search button */}
        <Button variant="ghost" size="sm" className="md:hidden hover:bg-blue-50/50">
          <Search className="w-5 h-5 text-gray-600" />
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-blue-50/50">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-effect" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white font-medium ${getRoleBadge(session?.user?.role || 'USER')}`}>
                    {session?.user?.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-blue-50/50">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-blue-50/50">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="hover:bg-red-50/50 text-red-600"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
