export interface Task {
  id: string
  projectId: string
  name: string
  startDate: string // ISO 8601 format
  endDate: string | null
  assignee: string
  phase: string
  description?: string
  isMilestone: boolean
  dependencies: string[] // Task IDs
  position: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

export interface GanttConfig {
  timeScale: 'day' | 'week' | 'month'
  zoom: number // 50-300
  showWeekends: boolean
  showHolidays: boolean
  colorScheme: Record<string, string> // phase -> color
}

export interface ShareLink {
  id: string
  projectId: string
  token: string
  permission: 'view' | 'comment' | 'edit'
  expiresAt: string | null
  createdAt: string
}

export interface User {
  id: string
  email: string
  displayName: string
  createdAt: string
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[]
  createdAt: string
}
