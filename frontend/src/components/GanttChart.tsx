import { useRef, useEffect, useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import {
  dateToX,
  calculateTaskWidth,
  getDateRange,
  generateTimelineLabels,
  getPhaseColor,
  DEFAULT_DIMENSIONS,
} from '../utils/ganttRenderer'
import dayjs from 'dayjs'

export default function GanttChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tasks, ganttConfig } = useProjectStore()
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(containerRef.current.clientHeight, tasks.length * 50 + 100),
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [tasks.length])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置高 DPI 显示
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.scale(dpr, dpr)

    // 清空画布
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    if (tasks.length === 0) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('暂无任务，请添加任务', dimensions.width / 2, dimensions.height / 2)
      return
    }

    const { start: projectStart, end: projectEnd } = getDateRange(tasks)
    const timelineLabels = generateTimelineLabels(projectStart, projectEnd, ganttConfig.timeScale)

    // 绘制背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // 绘制时间轴
    drawTimeline(ctx, timelineLabels, projectStart)

    // 绘制今日线
    drawTodayLine(ctx, projectStart)

    // 绘制任务条
    drawTasks(ctx, tasks, projectStart)
  }, [tasks, ganttConfig, dimensions])

  const drawTimeline = (
    ctx: CanvasRenderingContext2D,
    labels: Array<{ date: string; label: string }>,
    startDate: string
  ) => {
    const { headerHeight, leftPanelWidth } = DEFAULT_DIMENSIONS

    // 绘制表头背景
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, dimensions.width, headerHeight)

    // 绘制左侧面板表头
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('任务名称', 10, 30)

    // 绘制时间标签
    ctx.fillStyle = '#374151'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'

    labels.forEach(({ date, label }) => {
      const x = dateToX(date, startDate, DEFAULT_DIMENSIONS, ganttConfig.zoom)
      
      // 绘制垂直网格线
      ctx.strokeStyle = '#e5e7eb'
      ctx.beginPath()
      ctx.moveTo(x, headerHeight)
      ctx.lineTo(x, dimensions.height)
      ctx.stroke()

      // 绘制日期标签
      ctx.fillText(label, x + 20, 35)
    })

    // 绘制表头底部边框
    ctx.strokeStyle = '#d1d5db'
    ctx.beginPath()
    ctx.moveTo(0, headerHeight)
    ctx.lineTo(dimensions.width, headerHeight)
    ctx.stroke()
  }

  const drawTodayLine = (ctx: CanvasRenderingContext2D, startDate: string) => {
    const today = dayjs().format('YYYY-MM-DD')
    const x = dateToX(today, startDate, DEFAULT_DIMENSIONS, ganttConfig.zoom)

    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(x, DEFAULT_DIMENSIONS.headerHeight)
    ctx.lineTo(x, dimensions.height)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineWidth = 1
  }

  const drawTasks = (ctx: CanvasRenderingContext2D, tasks: Task[], startDate: string) => {
    const { rowHeight, headerHeight, leftPanelWidth } = DEFAULT_DIMENSIONS

    tasks.forEach((task, index) => {
      const y = headerHeight + index * rowHeight + 10

      // 绘制任务名称（左侧面板）
      ctx.fillStyle = '#1f2937'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(
        task.name.length > 20 ? task.name.substring(0, 20) + '...' : task.name,
        10,
        y + 20
      )

      // 绘制任务条
      const x = dateToX(task.startDate, startDate, DEFAULT_DIMENSIONS, ganttConfig.zoom)
      const width = calculateTaskWidth(
        task.startDate,
        task.endDate,
        DEFAULT_DIMENSIONS,
        ganttConfig.zoom
      )

      const color = getPhaseColor(task.phase, ganttConfig.colorScheme)

      if (task.isMilestone) {
        // 绘制里程碑（菱形）
        drawDiamond(ctx, x, y + 15, 20, color)
      } else {
        // 绘制普通任务条
        ctx.fillStyle = color
        ctx.fillRect(x, y, width, 30)

        // 绘制任务条边框
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, 30)

        // 绘制任务名称（任务条内）
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'left'
        const taskLabel = task.name.length > 15 ? task.name.substring(0, 15) + '...' : task.name
        ctx.fillText(taskLabel, x + 5, y + 20)
      }
    })
  }

  const drawDiamond = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y - size / 2)
    ctx.lineTo(x + size / 2, y)
    ctx.lineTo(x, y + size / 2)
    ctx.lineTo(x - size / 2, y)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-white rounded-lg shadow">
      <canvas ref={canvasRef} className="cursor-pointer" />
    </div>
  )
}
