"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both email and password.",
      })
      return
    }

    setIsLoading(true)
    try {
      await login(formData.email, formData.password)
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    // placeholder — backend route or OAuth flow should handle this path
    window.location.href = "/auth/google"
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Branding */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-200 via-white to-sky-200 text-slate-900 items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span>Skill</span>
            <span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-sky-600">Tracker</span>
          </h1>
          <p className="mt-4 text-lg text-slate-700">Track habits, build streaks, and level up your skills.</p>
        </div>
      </div>

      {/* Right: Auth Card */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">Or sign in with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full flex items-center justify-center gap-3" onClick={handleGoogleSignIn}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.45 1.22 8.39 2.83l6.24-6.24C34.6 2.08 29.66 0 24 0 14.73 0 6.95 5.79 3.54 13.9l7.43 5.77C12.98 14.02 18.98 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.45 24.5c0-1.6-.14-2.8-.44-4.03H24v8.03h12.63c-.54 2.9-2.33 5.34-4.97 6.98l7.6 5.9C44.97 38.1 46.45 31.7 46.45 24.5z"/>
                    <path fill="#FBBC05" d="M11.0 29.67A14.98 14.98 0 0 1 9.32 24c0-1.34.2-2.64.56-3.86L3.54 14.9C1.2 19.87 0 24.97 0 30.16c0 5.3 1.2 10.4 3.54 15.37l7.43-5.77c-.53-1.8-.97-3.62-.97-5.09z"/>
                    <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.15 15.88-5.86l-7.6-5.9c-2.14 1.44-4.89 2.3-8.28 2.3-5.02 0-11.02-4.52-12.92-10.27l-7.43 5.77C6.95 42.21 14.73 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline underline-offset-4">
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
