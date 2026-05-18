"use client"

import type React from "react"
import { Sidebar } from "./sidebar"

import { AuthGuard } from "@/components/auth-guard"
import { Rocket } from "lucide-react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 md:block fixed h-full inset-y-0 z-50">
          <Sidebar />
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b bg-background/80 backdrop-blur-md flex items-center px-4 justify-between">
          
        </header>

        {/* Main Content */}
        <main className="flex-1 md:pl-64 pt-14 md:pt-0 pb-12 md:pb-0">
          <div className="container mx-auto p-4 md:p-6 max-w-5xl">{children}</div>
        </main>

        {/* Mobile Navigation */}
       
      </div>
    </AuthGuard>
  )
}
