"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Rocket, Trophy, Calendar, Plus, ArrowRight, Zap, Target } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { dashboardApi, skillsApi } from "@/lib/api"
import type { DashboardData, Skill } from "@/lib/types"

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow/Gold
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316"  // Orange
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.get(), skillsApi.getAll()])
      .then(([dbData, skillsData]) => {
        setData(dbData)
        setSkills(skillsData)
      })
      .catch((err) => {
        console.error("Dashboard page load failed", err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!data) return <p className="text-red-500">Failed to load dashboard</p>

  const activeSkills = skills.filter((s) => s.isActive)
  const chartData = activeSkills.map((s) => ({
    name: s.name,
    value: s.totalPractices || 1,
    streak: s.currentStreak,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's how you're doing today.</p>
        </div>
        <div className="text-xs font-semibold bg-accent text-accent-foreground px-4 py-2 rounded-full border border-primary/20">
          ✨ Futuristic tracking active
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Skills"
          value={data.totalSkills}
          icon={Rocket}
          description="Skills you're mastering"
          cardClass="bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_35px_-5px_rgba(79,70,229,0.5)] border-none"
        />
        <StatCard
          title="Active Streak"
          value={data.activeStreak}
          icon={Zap}
          description="Days in a row"
          cardClass="bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_10px_20px_-5px_rgba(245,158,11,0.3)] hover:shadow-[0_20px_35px_-5px_rgba(245,158,11,0.5)] border-none"
          iconClass="animate-bounce"
        />
        <StatCard
          title="Completed Today"
          value={data.practicedToday}
          icon={Trophy}
          description="Skills practiced today"
          cardClass="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_35px_-5px_rgba(16,185,129,0.5)] border-none"
        />
        <StatCard
          title="Days Tracked"
          value={data.daysTracked}
          icon={Calendar}
          description="Total commitment"
          cardClass="bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-[0_10px_20px_-5px_rgba(236,72,153,0.3)] hover:shadow-[0_20px_35px_-5px_rgba(236,72,153,0.5)] border-none"
        />
      </div>

      {/* Motivation + Quick Actions + Pie Chart */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Pie Chart Card */}
        <Card className="col-span-full lg:col-span-4 border border-border dark:border-primary/20 dark:bg-black/40 backdrop-blur-md hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Active Skills Distribution</span>
            </CardTitle>
            <CardDescription>Visual breakdown of your effort per skill</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] flex flex-col md:flex-row items-center justify-center gap-4">
            {chartData.length > 0 ? (
              <>
                <div className="w-full md:w-1/2 h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                        animationBegin={200}
                        animationDuration={1200}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-foreground">{activeSkills.length}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                      Active
                    </span>
                  </div>
                </div>

                {/* Custom Legend */}
                <div className="w-full md:w-1/2 max-h-[220px] overflow-y-auto space-y-1.5 pr-2">
                  {chartData.map((entry, index) => {
                    const skill = activeSkills[index]
                    return (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-semibold truncate">{entry.name}</span>
                        </div>
                        <span className="text-muted-foreground text-[11px] shrink-0 ml-2">
                          {skill.totalPractices} logs • {skill.currentStreak}d streak
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <Target className="h-10 w-10 text-muted-foreground animate-bounce" />
                <div>
                  <p className="font-medium text-foreground">No active skills tracking</p>
                  <p className="text-xs text-muted-foreground max-w-[250px] mt-1">
                    Activate some skills in the Skills page to start tracking!
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/skills">Manage Skills</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-full lg:col-span-3 border border-border dark:border-primary/20 dark:bg-black/40 backdrop-blur-md hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get things done faster.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild variant="outline" className="justify-start gap-3 h-14 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link href="/skills?add=true">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">Add New Skill</div>
                  <div className="text-[10px] text-muted-foreground">Introduce a new habit</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-14 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link href="/logs?add=true">
                <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">Add Practice Log</div>
                  <div className="text-[10px] text-muted-foreground">Log today's practice</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Motivation Bottom Card */}
      <Card className="border border-border dark:border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 dark:from-primary/10 dark:to-transparent backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Daily Boost</span>
          <CardTitle className="text-xl font-bold">Motivation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-background/50 dark:bg-black/50 p-6 border border-border dark:border-primary/10">
            <blockquote className="text-lg font-medium italic text-foreground/90">
              "{data.motivation}"
            </blockquote>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-popover border border-border p-3 rounded-2xl shadow-xl text-xs space-y-1">
        <p className="font-extrabold text-foreground">{data.name}</p>
        <p className="text-muted-foreground">
          Total Practices: <span className="font-bold text-primary">{data.value}</span>
        </p>
        <p className="text-muted-foreground">
          Current Streak: <span className="font-bold text-primary">{data.streak} days</span>
        </p>
      </div>
    )
  }
  return null
}

function StatCard({ title, value, icon: Icon, description, cardClass, iconClass }: any) {
  return (
    <Card className={`hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer group ${cardClass ?? ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-90">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-white/20 text-white shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Icon className={`h-4 w-4 ${iconClass ?? ""}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-4xl font-extrabold tracking-tight">{value}</div>
        <p className="text-[11px] opacity-80 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-72 rounded-3xl" />
        <Skeleton className="lg:col-span-3 h-72 rounded-3xl" />
      </div>
    </div>
  )
}
