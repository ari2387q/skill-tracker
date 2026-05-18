import type { Skill, Log, DashboardData, StatsData, User } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")
  const headers: HeadersInit = { "Content-Type": "application/json", ...options.headers }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }))
    throw new ApiError(res.status, err.message || "Request failed")
  }
  return res.json()
}

/* ========== Auth API ========== */
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
    if (data.token) localStorage.setItem("token", data.token)
    return data
  },
  register: async (email: string, password: string, name?: string) => {
    const data = await fetchWithAuth("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) })
    if (data.token) localStorage.setItem("token", data.token)
    return data
  },
  logout: () => localStorage.removeItem("token"),
  getProfile: async (): Promise<{ user: User }> => fetchWithAuth("/auth/profile"),
}

/* ========== Skills API ========== */
export const skillsApi = {
  getAll: async (): Promise<Skill[]> => {
    const res = await fetchWithAuth("/skills")
    if (Array.isArray(res)) return res
    if ("skills" in res) return res.skills as Skill[]
    return []
  },
  toggleActive: async (id: string): Promise<Skill> => {
  return fetchWithAuth(`/skills/${id}/toggle`, {
    method: "PATCH",
  }) as Promise<Skill>
},


  create: async (name: string): Promise<Skill> => {
    const res = await fetchWithAuth("/skills", { method: "POST", body: JSON.stringify({ name }) })
    const payload = res as any
    // backend may return { success: true, skill } or the skill directly
    const backendSkill = payload.skill ?? payload
    return backendSkill as Skill
  },
  markPracticed: async (id: string): Promise<Skill> => fetchWithAuth(`/skills/${id}/practice`, { method: "POST", body: JSON.stringify({}) }) as Promise<Skill>,
}

/* ========== Logs API ========== */
export const logsApi = {
  getAll: async (start?: string, end?: string): Promise<Log[]> => {
    const params = new URLSearchParams()
    if (start) params.append("startDate", start)
    if (end) params.append("endDate", end)
    const query = params.toString() ? `?${params.toString()}` : ""

    const res = await fetchWithAuth(`/logs${query}`)
    const raw = res.logs ?? []
    // Normalize backend log shape to frontend `Log` type
    return (Array.isArray(raw) ? raw : []).map((backendLog: any) => {
      const id = backendLog._id ?? backendLog.id ?? ""
      const skillId = backendLog.skill?.toString?.() ?? backendLog.skillId ?? ""
      const skillName = backendLog.skill?.name ?? backendLog.skillName ?? ""
      const date = backendLog.practicedAt ?? backendLog.date ?? ""
      const notes = backendLog.notes ?? null
      const createdAt = backendLog.createdAt ?? new Date().toISOString()
      return {
        id,
        skillId,
        skillName,
        date,
        notes,
        createdAt,
      } as Log
    })
  },

  create: async (skillId: string, practicedAt: string, notes?: string): Promise<Log> => {
    const body = { skillId, practicedAt, notes }
    const res = await fetchWithAuth("/logs", {
      method: "POST",
      body: JSON.stringify(body),
    })
   
    const payload = res as any
    const backendLog =
      payload.log ?? (Array.isArray(payload.logs) ? payload.logs[0] : null) ??
      (payload && (payload._id || payload.id) ? payload : null)

    if (!backendLog) throw new ApiError(500, "Unexpected response from logs.create")

    const id = backendLog._id ?? backendLog.id ?? ""
    const skillIdResp = backendLog.skill?.toString?.() ?? backendLog.skillId ?? ""
    const skillName = backendLog.skillName ?? backendLog.skill?.name ?? ""
    const date = backendLog.practicedAt ?? backendLog.date
    const notesResp = backendLog.notes ?? null
    const createdAt = backendLog.createdAt ?? new Date().toISOString()

    return {
      id,
      skillId: skillIdResp,
      skillName,
      date,
      notes: notesResp,
      createdAt,
    }
  },
getGrouped: async (): Promise<Record<string, Record<string, Log[]>>> => {
  const res = await fetchWithAuth("/logs/grouped")
  const grouped = res.grouped ?? {}

  const normalized: Record<string, Record<string, Log[]>> = {}

  Object.entries(grouped).forEach(([date, skills]: any) => {
    normalized[date] = {}

    Object.entries(skills).forEach(([skillName, logs]: any) => {
      normalized[date][skillName] = (logs as any[]).map((backendLog) => {
        const id = backendLog._id ?? backendLog.id ?? ""
        const skillId =
          backendLog.skill?.toString?.() ??
          backendLog.skillId ??
          ""
        const createdAt =
          backendLog.createdAt ?? new Date().toISOString()

        return {
          id,
          skillId,
          skillName,
          date: backendLog.practicedAt,
          notes: backendLog.notes ?? null,
          createdAt,
        } as Log
      })
    })
  })

  return normalized
},

update: async (
  logId: string,
  updates: { notes?: string; practicedAt?: string; duration?: number }
): Promise<Log> => {
  const res = await fetchWithAuth(`/logs/${logId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })

  const backendLog = res.log ?? res

  if (!backendLog) {
    throw new ApiError(500, "Unexpected response from logs.update")
  }

  return {
    id: backendLog._id ?? backendLog.id,
    skillId:
      backendLog.skill?.toString?.() ??
      backendLog.skillId ??
      "",
    skillName:
      backendLog.skillName ??
      backendLog.skill?.name ??
      "",
    date: backendLog.practicedAt,
    notes: backendLog.notes ?? null,
    createdAt:
      backendLog.createdAt ?? new Date().toISOString(),
  }
},

remove: async (logId: string): Promise<void> => {
  await fetchWithAuth(`/logs/${logId}`, {
    method: "DELETE",
  })
},

}
export const aiApi = {
  send: async (prompt: string) =>
    fetchWithAuth("/ai", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  getHistory: async () => {
    const res = await fetchWithAuth("/ai/history");
    return res;
  },
};


export const dashboardApi = {
  get: async (): Promise<DashboardData> => {
    return fetchWithAuth("/dashboard")
  },
}