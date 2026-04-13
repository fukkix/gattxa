export interface Task {
  id: string
  projectId: string
  name: string
  startDate: string | null // ISO 8601 format, null 表示未设置
  endDate: string | null
  assignee: string
  phase: string
  description?: string
  isMilestone: boolean
  dependencies: string[] // Task IDs
  position: number
  version: number // 版本号，用于冲突检测
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
  name: string
  displayName?: string
  createdAt: string
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[]
  createdAt: string
  updatedAt: string
  user_name?: string
  user_email?: string
}

export interface Notification {
  comment_id: string
  content: string
  created_at: string
  task_id: string
  task_name: string
  project_id: string
  project_name: string
  user_id: string
  user_name: string
  user_email: string
  is_read: boolean
}
