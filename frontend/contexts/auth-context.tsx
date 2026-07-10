"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 🔑 Restore session using BACKEND
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("TOKEN:", localStorage.getItem("token"))

        const { user } = await authApi.getProfile()
        setUser(user)
      } catch {
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { user } = await authApi.login(email, password)
    setUser(user)
    router.push("/dashboard")
  }

  const register = async (email: string, password: string, name?: string) => {
    await authApi.register(email, password, name)
  
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}