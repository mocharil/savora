'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import PageLoader from '@/components/ui/page-loader'

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

// Safe hook that returns null if not in context (for SSR compatibility)
export function useSidebarOptional() {
  return useContext(SidebarContext)
}

interface AdminLayoutClientProps {
  children: ReactNode
  sidebar: ReactNode
  header: ReactNode
}

export function AdminLayoutClient({ children, sidebar, header }: AdminLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  // Track navigation changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  // Listen for link clicks to show loading
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link && link.href && link.href.startsWith(window.location.origin + '/admin')) {
        const targetPath = new URL(link.href).pathname
        if (targetPath !== pathname) {
          setIsNavigating(true)
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
      <div className="min-h-screen bg-[#F9FAFB]">
        {sidebar}
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}>
          {header}
          <main className="p-6">
            {isNavigating ? (
              <PageLoader message="Memuat halaman..." />
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
