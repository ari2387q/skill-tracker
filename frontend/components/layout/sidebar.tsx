"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Rocket, ClipboardList, BarChart3, LogOut, Sun, Moon, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Skills", href: "/skills", icon: Rocket },
  { name: "Logs", href: "/logs", icon: ClipboardList },
  { name: "AI Model", href: "/ai", icon: BarChart3 },
]

interface SidebarProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-extrabold text-xl text-foreground hover:scale-105 transition-transform duration-200"
          onClick={onClose}
        >
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Rocket className="h-5 w-5 animate-pulse" />
          </div>
          <span className="tracking-tight">
            Skill<span className="text-primary">Tracker</span>
          </span>
        </Link>
        {/* Close button (mobile only) */}
        {onClose && (
          <button
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 px-5 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/10 border-b border-white/10"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110" : "")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggler */}
      <div className="px-6 py-4 border-t border-sidebar-border flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9 bg-muted hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all duration-300 active:scale-90"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
            ) : (
              <Moon className="h-4 w-4 text-secondary" />
            )}
          </Button>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-4 px-3">
          <p className="text-sm font-bold text-foreground">{user?.name || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-5 py-3 text-sm font-semibold rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen = false, onOpenChange }: SidebarProps) {
  const close = () => onOpenChange?.(false)

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex h-full flex-col">
        <NavContent />
      </div>

      {/* Mobile: Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Mobile: Slide-in Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent onClose={close} />
      </div>
    </>
  )
}

export function BurgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-all duration-200 active:scale-90"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
