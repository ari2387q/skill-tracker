"use client"

import React from "react"
import { Plus, Zap, CheckCircle2, Power } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Skill } from "@/lib/types"
import { skillsApi } from "@/lib/api"

export default function SkillsPage() {
  const [skills, setSkills] = React.useState<Skill[]>([])
  const [loading, setLoading] = React.useState(false)
  const [newSkill, setNewSkill] = React.useState("")

  const fetchSkills = async () => {
    const data = await skillsApi.getAll()
    setSkills(data)
  }

  React.useEffect(() => {
    fetchSkills()
  }, [])

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    setLoading(true)
    try {
      const created = await skillsApi.create(newSkill.trim())
      // append created skill to local state to avoid overwriting optimistic changes
      setSkills((prev) => [created, ...prev])
      setNewSkill("")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPracticed = async (id: string) => {
    setLoading(true)
    // optimistic update: increment streak locally first
    const prevSkills = [...skills]
    const prevSkill = prevSkills.find((s) => s.id === id)
    setSkills((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              currentStreak: (s.currentStreak ?? 0) + 1,
              lastPracticed: new Date().toISOString(),
            }
          : s
      )
    )

    try {
      const updated = await skillsApi.markPracticed(id)
      // reconcile with server response when available
      if (updated) {
        setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, currentStreak: updated.currentStreak ?? s.currentStreak, lastPracticed: (updated as any).lastPracticed ?? s.lastPracticed } : s)))
      }
    } catch (err) {
      // rollback on error
      if (prevSkill) {
        setSkills((prev) => prev.map((s) => (s.id === id ? prevSkill : s)))
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string) => {
    setLoading(true)
    await skillsApi.toggleActive(id)
    await fetchSkills()
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Skills</h1>
        <p className="text-muted-foreground">
          Track what you practice daily
        </p>
      </div>

      {/* Add Skill */}
      <div className="flex gap-3 max-w-md">
        <Input
          placeholder="Enter new skill..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
          className="rounded-full px-5 py-3 h-11 border-border"
        />
        <Button onClick={handleAddSkill} disabled={loading} className="rounded-full px-5 h-11 font-bold">
          <Plus className="h-4 w-4 mr-1" /> Add Skill
        </Button>
      </div>

      {/* Skills Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => {
          const practicedToday =
            skill.lastPracticed &&
            new Date(skill.lastPracticed).toDateString() ===
              new Date().toDateString()

          return (
            <Card
              key={skill.id}
              className={cn(
                "rounded-3xl border border-border dark:border-primary/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] bg-card",
                !skill.isActive && "opacity-60"
              )}
            >
              <CardHeader className="flex flex-row justify-between items-start pb-2">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    {skill.name}
                    {practicedToday && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                  </CardTitle>

                  <Badge variant={skill.isActive ? "default" : "secondary"} className="rounded-full">
                    {skill.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted"
                  onClick={() => handleToggleActive(skill.id)}
                  title="Toggle active"
                >
                  <Power className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/10">
                  <Zap className="h-5 w-5 text-amber-500 animate-pulse" />
                  <span className="text-2xl font-black text-foreground">
                    {skill.currentStreak}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    day streak
                  </span>
                </div>

                <Button
                  className="w-full rounded-full font-bold h-11"
                  disabled={!skill.isActive || practicedToday || loading}
                  onClick={() => handleMarkPracticed(skill.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {practicedToday ? "Practiced Today" : "Mark Practiced"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}