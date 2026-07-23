"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { Menu, LogOut, Sun, Moon, User as UserIcon, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopHeader() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="hidden md:flex fixed top-0 right-0 left-72 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md items-center px-8 justify-end transition-all duration-300">
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full h-10 w-10 hover:bg-muted transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg shadow-primary/5 p-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-border mb-2">
              <p className="text-sm font-bold text-foreground">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            
            <div className="space-y-1">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>Theme</span>
                  </div>
                  <span className="text-xs capitalize">{theme}</span>
                </button>
              )}
              
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              
              <div className="h-px bg-border my-2" />
              
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
