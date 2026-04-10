import dayjs from 'dayjs'
import { Task, GanttConfig } from '../types'

export interface GanttDimensions {
  dayWidth: number
  rowHeight: number
  headerHeight: number
  leftPanelWidth: number
}

export const DEFAULT_DIMENSIONS: GanttDimensions = {
  dayWidth: 40,
  rowHeight: 40,
  headerHeight: 60,
  leftPanelWidth: 200,
}

export const dateToX = (
  date: string,
  startDate: string,
  dimensions: GanttDimensions,
  zoom: number
): number => {
  const days = dayjs(date).diff(dayjs(startDate), 'day')
  return dimensions.leftPanelWidth + days * dimensions.dayWidth * (zoom / 100)
}

export const calculateTaskWidth = (
  startDate: string,
  endDate: string | null,
  dimensions: GanttDimensions,
  zoom: number
): number => {
  if (!endDate) return dimensions.dayWidth * (zoom / 100) // 默认宽度
  const days = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
  return Math.max(days * dimensions.dayWidth * (zoom / 100), 20)
}

export const getDateRange = (tasks: Task[]): { start: string; end: string } => {
  if (tasks.length === 0) {
    const today = dayjs().format('YYYY-MM-DD')
    return { start: today, end: dayjs().add(30, 'day').format('YYYY-MM-DD') }
  }

  let minDate = dayjs(tasks[0].startDate)
  let maxDate = dayjs(tasks[0].endDate || tasks[0].startDate)

  tasks.forEach(task => {
    const start = dayjs(task.startDate)
    const end = dayjs(task.endDate || task.startDate)
    
    if (start.isBefore(minDate)) minDate = start
    if (end.isAfter(maxDate)) maxDate = end
  })

  // 添加前后缓冲
  return {
    start: minDate.subtract(7, 'day').format('YYYY-MM-DD'),
    end: maxDate.add(7, 'day').format('YYYY-MM-DD'),
  }
}

export const groupTasksByPhase = (tasks: Task[]): Record<string, Task[]> => {
  return tasks.reduce((acc, task) => {
    const phase = task.phase || '未分组'
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(task)
    return acc
  }, {} as Record<string, Task[]>)
}

export const getPhaseColor = (phase: string, colorScheme: Record<string, string>): string => {
  return colorScheme[phase] || '#6b7280'
}

export const generateTimelineLabels = (
  startDate: string,
  endDate: string,
  timeScale: 'day' | 'week' | 'month'
): Array<{ date: string; label: string }> => {
  const labels: Array<{ date: string; label: string }> = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isBefore(end) || current.isSame(end)) {
    let label = ''
    
    switch (timeScale) {
      case 'day':
        label = current.format('MM/DD')
        break
      case 'week':
        label = `第${current.week()}周`
        break
      case 'month':
        label = current.format('YYYY-MM')
        break
    }

    labels.push({
      date: current.format('YYYY-MM-DD'),
      label,
    })

    current = current.add(1, timeScale)
  }

  return labels
}
