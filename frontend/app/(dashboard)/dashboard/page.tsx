"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Rocket, Trophy, Calendar, Plus, ArrowRight, Zap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { dashboardApi } from "@/lib/api"
import type { DashboardData } from "@/lib/types"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch(err => {
        console.error("Dashboard fetch failed", err)
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!data) return <p className="text-red-500">Failed to load dashboard</p>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's how you're doing today.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Skills"
          value={data.totalSkills}
          icon={Rocket}
          description="Skills you're mastering"
        />
        <StatCard
          title="Active Streak"
          value={data.activeStreak}
          icon={Zap}
          description="Days in a row"
          className="text-orange-500"
        />
        <StatCard
          title="Completed Today"
          value={data.practicedToday}
          icon={Trophy}
          description="Skills practiced today"
          className="text-green-500"
        />
        <StatCard
          title="Days Tracked"
          value={data.daysTracked}
          icon={Calendar}
          description="Total commitment"
          className="text-blue-500"
        />
      </div>

      {/* Motivation + Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Motivation</CardTitle>
            <CardDescription>Your progress matters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-primary/5 p-6 border border-primary/10">
              <blockquote className="text-lg font-medium text-primary">
                {data.motivation}
              </blockquote>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get things done faster.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline" className="justify-start gap-2 h-12">
              <Link href="/skills?add=true">
                <Plus className="h-4 w-4" />
                Add New Skill
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2 h-12">
              <Link href="/logs?add=true">
                <Plus className="h-4 w-4" />
                Add Practice Log
              </Link>
            </Button>
            <Button asChild className="justify-start gap-2 h-12">
              <Link href="/stats">
                <ArrowRight className="h-4 w-4" />
                View Full Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, description, className }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${className ?? ""}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-48" />
        <Skeleton className="lg:col-span-3 h-48" />
      </div>
    </div>
  )
}
