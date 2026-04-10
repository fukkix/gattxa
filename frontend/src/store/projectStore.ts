import { create } from 'zustand'
import { Task, Project, GanttConfig } from '../types'

interface ProjectState {
  currentProject: Project | null
  tasks: Task[]
  ganttConfig: GanttConfig
  isSaving: boolean
  lastSaved: Date | null
  
  // Actions
  setProject: (project: Project) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setTasks: (tasks: Task[]) => void
  updateGanttConfig: (config: Partial<GanttConfig>) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  tasks: [],
  ganttConfig: {
    timeScale: 'day',
    zoom: 100,
    showWeekends: true,
    showHolidays: false,
    colorScheme: {
      '阶段一': '#3b82f6',
      '阶段二': '#10b981',
      '阶段三': '#f59e0b',
      '阶段四': '#ef4444',
      '阶段五': '#8b5cf6',
    },
  },
  isSaving: false,
  lastSaved: null,

  setProject: (project) => set({ currentProject: project, tasks: project.tasks || [] }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    })),
  
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
  
  setTasks: (tasks) => set({ tasks }),
  
  updateGanttConfig: (config) =>
    set((state) => ({ ganttConfig: { ...state.ganttConfig, ...config } })),
  
  setSaving: (saving) => set({ isSaving: saving }),
  
  setLastSaved: (date) => set({ lastSaved: date }),
}))
