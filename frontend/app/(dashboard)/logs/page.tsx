"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ClipboardList, Plus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

import { logsApi, skillsApi } from "@/lib/api"
import type { Log, Skill } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ADD
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState("")
  const [logNotes, setLogNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // EDIT
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // DELETE
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  const { toast } = useToast()

  const getSkillName = (log: Log) => {
    if (log.skillName) return log.skillName
    const found = skills.find((s) => s.id === log.skillId)
    return found ? found.name : "Unknown Skill"
  }

  /* =========================
        FILTER + DEDUPE
     ========================= */
  const visibleLogs = (() => {
    const filtered = logs.filter((log) => {
      if (log.skillName) return true
      return skills.some((s) => s.id === log.skillId)
    })

    const dayKey = (d?: string) => {
      if (!d) return ""
      const dt = new Date(d)
      if (isNaN(dt.getTime())) return ""
      return dt.toISOString().split("T")[0]
    }

    const groups: Record<string, Log[]> = {}
    for (const lg of filtered) {
      const key = `${lg.skillId}::${dayKey(lg.date)}`
      groups[key] = groups[key] || []
      groups[key].push(lg)
    }

    const result: Log[] = []
    Object.values(groups).forEach((arr) => {
      const withNotes = arr.find((a) => a.notes?.trim())
      if (withNotes) result.push(withNotes)
      else result.push(arr.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0])
    })

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })()

  /* =========================
        FETCH DATA
     ========================= */
  useEffect(() => {
    async function fetchData() {
      try {
        const [logsData, skillsData] = await Promise.all([
          logsApi.getAll(),
          skillsApi.getAll(),
        ])
        setLogs(logsData)
        setSkills(skillsData.filter((s) => s.isActive))
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  /* =========================
          ADD LOG
     ========================= */
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSkillId) return

    setIsSubmitting(true)
    try {
      await logsApi.create(selectedSkillId, new Date().toISOString(), logNotes)
      toast({ title: "Log added" })
      setIsAddDialogOpen(false)
      setSelectedSkillId("")
      setLogNotes("")
      setLogs(await logsApi.getAll())
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }
          //UPDATE LOG 
  const handleUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLog) return

    try {
      await logsApi.update(editingLog.id, { notes: editNotes })
      toast({ title: "Log updated" })
      setIsEditDialogOpen(false)
      setEditingLog(null)
      setEditNotes("")
      setLogs(await logsApi.getAll())
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message })
    }
  }
          //DELETE LOG
  const handleDeleteLog = async (logId: string) => {
  try {
    await logsApi.remove(logId)

    toast({
      title: "Log deleted",
    })

    setLogs(prev => prev.filter(l => l.id !== logId))
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Delete failed",
      description: error.message || "Could not delete log",
    })
  }
}

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Practice Logs</h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" />Add Daily</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddLog}>
              <DialogHeader>
                <DialogTitle>Add Log</DialogTitle>
              </DialogHeader>

              <Label>Skill</Label>
              <select
                className="w-full border rounded p-2"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
              >
                <option value="">Select skill</option>
                {skills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <Label className="mt-3 block">Notes</Label>
              <Textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} />

              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LOG LIST */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : visibleLogs.map((log) => (
            <div key={log.id} className="py-3 border-b">
              <div className="flex justify-between">
                <b>{getSkillName(log)}</b>
                <span className="text-sm text-muted-foreground">
                  {new Date(log.date).toDateString()}
                </span>
              </div>

              {log.notes && <p className="mt-2">{log.notes}</p>}

              <div className="mt-4 flex gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingLog(log)
                    setEditNotes(log.notes || "")
                    setIsEditDialogOpen(true)
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isDeletingId === log.id}
                  onClick={() => handleDeleteLog(log.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateLog}>
            <DialogHeader>
              <DialogTitle>Edit Log</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <DialogFooter>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
