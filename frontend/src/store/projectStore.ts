import { create } from 'zustand'
import { Task, Project, GanttConfig } from '../types'
import { updateProject as apiUpdateProject } from '../api/projects'
import { websocketService } from '../services/websocket'

interface ConflictInfo {
  taskId: string
  localTask: Task
  remoteTask: Task
}

interface ProjectState {
  currentProject: Project | null
  tasks: Task[]
  ganttConfig: GanttConfig
  isSaving: boolean
  lastSaved: Date | null
  conflicts: ConflictInfo[]
  
  // Actions
  setProject: (project: Project) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>, skipWebSocket?: boolean) => void
  deleteTask: (id: string) => void
  setTasks: (tasks: Task[]) => void
  reorderTasks: (tasks: Task[]) => void
  updateGanttConfig: (config: Partial<GanttConfig>) => void
  setSaving: (saving: boolean) => void
  setLastSaved: (date: Date) => void
  saveProject: () => Promise<void>
  addConflict: (conflict: ConflictInfo) => void
  resolveConflict: (taskId: string, resolvedTask: Task) => void
  removeConflict: (taskId: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
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
  conflicts: [],

  setProject: (project) => set({ currentProject: project, tasks: project.tasks || [] }),
  
  addTask: (task) => set((state) => {
    const updatedTasks = [...state.tasks, task]
    if (state.currentProject) {
      // 发送 WebSocket 事件
      if (websocketService.isConnected()) {
        websocketService.emitTaskCreate(state.currentProject.id, task)
      }
      return {
        tasks: updatedTasks,
        currentProject: { ...state.currentProject, tasks: updatedTasks }
      }
    }
    return { tasks: updatedTasks }
  }),
  
  updateTask: (id, updates, skipWebSocket = false) =>
    set((state) => {
      const updatedTasks = state.tasks.map((task) => 
        task.id === id ? { ...task, ...updates } : task
      )
      if (state.currentProject) {
        // 发送 WebSocket 事件（除非明确跳过）
        if (!skipWebSocket && websocketService.isConnected()) {
          const updatedTask = updatedTasks.find(t => t.id === id)
          if (updatedTask) {
            websocketService.emitTaskUpdate(state.currentProject.id, updatedTask, updatedTask.version)
          }
        }
        return {
          tasks: updatedTasks,
          currentProject: { ...state.currentProject, tasks: updatedTasks }
        }
      }
      return { tasks: updatedTasks }
    }),
  
  deleteTask: (id) => set((state) => {
    const updatedTasks = state.tasks.filter((task) => task.id !== id)
    if (state.currentProject) {
      // 发送 WebSocket 事件
      if (websocketService.isConnected()) {
        websocketService.emitTaskDelete(state.currentProject.id, id)
      }
      return {
        tasks: updatedTasks,
        currentProject: { ...state.currentProject, tasks: updatedTasks }
      }
    }
    return { tasks: updatedTasks }
  }),
  
  setTasks: (tasks) => set((state) => {
    if (state.currentProject) {
      return {
        tasks,
        currentProject: { ...state.currentProject, tasks }
      }
    }
    return { tasks }
  }),

  reorderTasks: (tasks) => set((state) => {
    if (state.currentProject) {
      return {
        tasks,
        currentProject: { ...state.currentProject, tasks }
      }
    }
    return { tasks }
  }),
  
  updateGanttConfig: (config) =>
    set((state) => ({ ganttConfig: { ...state.ganttConfig, ...config } })),
  
  setSaving: (saving) => set({ isSaving: saving }),
  
  setLastSaved: (date) => set({ lastSaved: date }),

  saveProject: async () => {
    const state = get()
    const { currentProject, tasks } = state

    if (!currentProject || currentProject.id.startsWith('temp_')) {
      throw new Error('无法保存临时项目，请先创建项目')
    }

    try {
      set({ isSaving: true })

      await apiUpdateProject(currentProject.id, {
        name: currentProject.name,
        description: currentProject.description,
        tasks,
      })

      set({ lastSaved: new Date(), isSaving: false })
    } catch (error) {
      set({ isSaving: false })
      throw error
    }
  },

  addConflict: (conflict) => set((state) => ({
    conflicts: [...state.conflicts, conflict]
  })),

  resolveConflict: (taskId, resolvedTask) => set((state) => {
    // 更新任务
    const updatedTasks = state.tasks.map((task) =>
      task.id === taskId ? resolvedTask : task
    )
    
    // 移除冲突
    const updatedConflicts = state.conflicts.filter((c) => c.taskId !== taskId)
    
    return {
      tasks: updatedTasks,
      conflicts: updatedConflicts,
      currentProject: state.currentProject
        ? { ...state.currentProject, tasks: updatedTasks }
        : null
    }
  }),

  removeConflict: (taskId) => set((state) => ({
    conflicts: state.conflicts.filter((c) => c.taskId !== taskId)
  })),
}))
