export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  isActive: boolean
  currentStreak: number
  longestStreak: number
  lastPracticed?: string
  totalPractices: number
  createdAt: string
  updatedAt: string
}

export interface Log {
  id: string
  skillId: string
  skillName: string
  date: string
  notes: string | null
  createdAt: string
}
export interface DashboardData {
  totalSkills: number
  practicedToday: number
  daysTracked: number
  activeStreak: number
  motivation: string
}


export interface StatsData {
  totalPractices: number
  activeStreaks: number
  longestStreak: number
  skillStats: {
    skillId: string
    skillName: string
    totalPractices: number
    currentStreak: number
  }[]
  dailyActivity: {
    date: string
    count: number
  }[]
}
