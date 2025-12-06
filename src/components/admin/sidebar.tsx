'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Store } from '@/types/database'
import { useSidebar } from './AdminLayoutClient'
import { PoweredBySavora } from '@/components/ui/powered-by-savora'
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderOpen,
  QrCode,
  ShoppingBag,
  BarChart3,
  Settings,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Receipt,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Menu item type
interface MenuItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
  badge?: boolean
  allowedRoles?: string[] // List of roles allowed to see this item
  tourId?: string // For product tour targeting
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

// Role definitions:
// - tenant_admin: Full access (Admin/Owner)
// - kitchen_staff: Dashboard, Pesanan (Staff Dapur)
// - waiter: Dashboard, Pesanan, Menu, Meja & QR (Pelayan)
// - cashier: Dashboard, POS Kasir, Pesanan (Kasir)

// Menu grouping structure
const menuGroups: MenuGroup[] = [
  {
    label: 'Ringkasan',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, tourId: 'sidebar-dashboard' },
    ]
  },
  {
    label: 'Operasional',
    items: [
      { name: 'POS Kasir', href: '/admin/pos', icon: Receipt, allowedRoles: ['tenant_admin', 'cashier'], tourId: 'sidebar-pos' },
      { name: 'Pesanan', href: '/admin/orders', icon: ShoppingBag, badge: true, tourId: 'sidebar-orders' },
    ]
  },
  {
    label: 'Menu & Meja',
    items: [
      { name: 'Menu', href: '/admin/menu', icon: UtensilsCrossed, allowedRoles: ['tenant_admin', 'waiter'], tourId: 'sidebar-menu' },
      { name: 'Kategori', href: '/admin/categories', icon: FolderOpen, allowedRoles: ['tenant_admin'], tourId: 'sidebar-categories' },
      { name: 'Meja & QR', href: '/admin/tables', icon: QrCode, allowedRoles: ['tenant_admin', 'waiter'], tourId: 'sidebar-tables' },
    ]
  },
  {
    label: 'Pengguna & Insight',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users, allowedRoles: ['tenant_admin'], tourId: 'sidebar-users' },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, allowedRoles: ['tenant_admin'], tourId: 'sidebar-analytics' },
    ]
  },
  {
    label: 'Pengaturan',
    items: [
      { name: 'Pengaturan', href: '/admin/settings', icon: Settings, allowedRoles: ['tenant_admin'], tourId: 'sidebar-settings' },
    ]
  },
]

interface AdminSidebarProps {
  store: Store | null
  pendingOrderCount?: number
  userRole?: string
  userName?: string
  userEmail?: string
  userAvatar?: string | null
  onSignOut?: () => void
}

export function AdminSidebar({
  store,
  pendingOrderCount = 0,
  userRole = 'tenant_admin',
  userName = 'User',
  userEmail = '',
  userAvatar = null,
  onSignOut,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch with Radix UI components
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get display role
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tenant_admin': return 'Admin'
      case 'kitchen_staff': return 'Staff Dapur'
      case 'waiter': return 'Pelayan'
      case 'cashier': return 'Kasir'
      default: return role
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Filter menu items based on user role
  const filterMenuItems = (items: typeof menuGroups[0]['items']) => {
    return items.filter(item => {
      // If no allowedRoles specified, all users can access
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true
      // Check if user's role is in the allowed roles list
      return item.allowedRoles.includes(userRole)
    })
  }

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut()
    } else {
      // Fallback: redirect to logout
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col bg-[#1E293B] transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo Section with Collapse Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3" data-tour="sidebar-logo">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full overflow-hidden">
              <Image
                src="/savora_logo.png"
                alt="Savora"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-sm text-white truncate">
                  Savora
                </span>
                <span className="text-xs text-white/60">Admin Panel</span>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200",
                  isCollapsed && "mx-auto"
                )}
              >
                {isCollapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              {isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation with Groups */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto hide-scrollbar">
          {menuGroups.map((group, groupIndex) => {
            const filteredItems = filterMenuItems(group.items)
            if (filteredItems.length === 0) return null

            return (
              <div key={group.label} className={cn(groupIndex > 0 && "mt-4")}>
                {/* Group Label */}
                {!isCollapsed && (
                  <div className="px-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      {group.label}
                    </span>
                  </div>
                )}
                {isCollapsed && groupIndex > 0 && (
                  <div className="mx-3 mb-2 border-t border-white/10" />
                )}

                {/* Menu Items */}
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const showBadge = item.badge && pendingOrderCount > 0

                    const menuItem = (
                      <Link
                        key={item.name}
                        href={item.href}
                        data-tour={item.tourId}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {showBadge && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-xs font-bold text-white">
                                {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
                              </span>
                            )}
                          </>
                        )}
                        {isCollapsed && showBadge && (
                          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
                            {pendingOrderCount > 9 ? '9+' : pendingOrderCount}
                          </span>
                        )}
                      </Link>
                    )

                    if (isCollapsed) {
                      return (
                        <Tooltip key={item.name}>
                          <TooltipTrigger asChild>
                            {menuItem}
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={10}>
                            {item.name}
                            {showBadge && ` (${pendingOrderCount})`}
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return menuItem
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Bottom Section - User Profile & Logout Side by Side */}
        <div className="border-t border-white/10 p-3" data-tour="sidebar-profile">
          <div className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-col" : "flex-row"
          )}>
            {/* Profile Link */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/admin/profile"
                    className="flex items-center justify-center rounded-xl p-2 hover:bg-white/10 transition-all duration-200"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userAvatar || undefined} alt={userName} />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <div className="text-sm">
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/admin/profile"
                className="flex-1 flex items-center gap-3 rounded-xl p-2 hover:bg-white/10 transition-all duration-200"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userAvatar || undefined} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{userName}</p>
                  <p className="text-xs text-white/60">{getRoleLabel(userRole)}</p>
                </div>
              </Link>
            )}

            {/* Logout Button with Confirmation */}
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <button
                      className="group flex items-center justify-center h-[52px] w-[52px] rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 hover:from-red-500/20 hover:to-orange-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                    >
                      <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
                    </button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <span className="text-sm">Keluar dari akun</span>
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
                      <LogOut className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <AlertDialogTitle className="text-lg">Keluar dari Akun?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        Anda akan keluar dari dashboard Savora.
                      </AlertDialogDescription>
                    </div>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  >
                    Ya, Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Powered by Savora */}
          {!isCollapsed && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <PoweredBySavora variant="light" size="sm" />
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
