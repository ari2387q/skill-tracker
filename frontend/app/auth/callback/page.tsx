"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get("token")
    
    if (token) {
      localStorage.setItem("token", token)
      
      // Note: We use window.location.href instead of router.push("/dashboard") here.
      // The AuthContext's initAuth effect only runs on mount (empty dependency array).
      // A client-side navigation (router.push) would not remount the AuthProvider,
      // so it wouldn't fetch the new user profile, leaving the app in a logged-out state.
      // A full page reload ensures AuthProvider mounts afresh and picks up the new token.
      window.location.href = "/dashboard"
    } else {
      router.push("/login?error=auth_failed")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-6"></div>
      <p className="text-xl font-bold tracking-tight text-foreground animate-pulse">
        Signing you in...
      </p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-6"></div>
        <p className="text-xl font-bold tracking-tight text-foreground animate-pulse">
          Signing you in...
        </p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
