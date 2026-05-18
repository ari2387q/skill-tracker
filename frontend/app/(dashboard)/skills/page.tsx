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
      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Enter new skill"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
        />
        <Button onClick={handleAddSkill} disabled={loading}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Skills Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => {
          // ✅ THIS IS THE MISSING LOGIC
          const practicedToday =
            skill.lastPracticed &&
            new Date(skill.lastPracticed).toDateString() ===
              new Date().toDateString()

          return (
            <Card
              key={skill.id}   // ✅ MUST USE _id
              className={cn(
                "transition-all",
                !skill.isActive && "opacity-60"
              )}
            >
              <CardHeader className="flex flex-row justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {skill.name}
                    {practicedToday && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>

                  <Badge variant={skill.isActive ? "default" : "secondary"}>
                    {skill.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(skill.id)}
                  title="Toggle active"
                >
                  <Power className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">
                    {skill.currentStreak}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    day streak
                  </span>
                </div>

                <Button
                  className="w-full"
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