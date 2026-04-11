import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useProjectStore } from '../store/projectStore'
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { getDateInfo } from '../utils/holidays'

dayjs.extend(minMax)
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)

// 为不同负责人生成一致的颜色
const getAssigneeColor = (assignee: string) => {
  if (!assignee) return { bg: '#E5E7EB', text: '#6B7280' }
  
  const colors = [
    { bg: '#9FE1CB', text: '#085041' }, // 青绿
    { bg: '#B5D4F4', text: '#0C447C' }, // 蓝色
    { bg: '#CECBF6', text: '#3C3489' }, // 紫色
    { bg: '#FFD4A3', text: '#8B4513' }, // 橙色
    { bg: '#FFB5C5', text: '#8B1538' }, // 粉色
    { bg: '#C7E9C0', text: '#2D5016' }, // 绿色
    { bg: '#FED9A6', text: '#7C4A00' }, // 黄色
    { bg: '#D4C5F9', text: '#4A1D96' }, // 淡紫
  ]
  
  // 使用负责人名称生成一致的哈希值
  let hash = 0
  for (let i = 0; i < assignee.length; i++) {
    hash = assignee.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

const GanttChart = forwardRef<HTMLCanvasElement>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tasks, ganttConfig } = useProjectStore()

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)

  useEffect(() => {
    renderGantt()
  }, [tasks, ganttConfig])

  // 监听滚动到今天的事件
  useEffect(() => {
    const handleScrollToToday = () => {
      const container = containerRef.current
      if (!container || tasks.length === 0) return

      // 计算今天的位置
      const dates = tasks.flatMap(t => [
        dayjs(t.startDate),
        t.endDate ? dayjs(t.endDate) : dayjs(t.startDate).add(7, 'day')
      ])
      const minDate = dayjs.min(dates)!.subtract(3, 'day')
      const today = dayjs()
      const todayDay = today.diff(minDate, 'day')
      
      if (todayDay >= 0) {
        const PHASE_WIDTH = 24
        const TASK_WIDTH = 200
        const ASSIGNEE_WIDTH = 100
        const LEFT_WIDTH = PHASE_WIDTH + TASK_WIDTH + ASSIGNEE_WIDTH
        
        const rect = container.getBoundingClientRect()
        const timelineWidth = rect.width - LEFT_WIDTH
        const totalDays = dayjs.max(dates)!.add(7, 'day').diff(minDate, 'day') + 1
        const dayWidth = timelineWidth / totalDays
        
        // 滚动到今天的位置（居中显示）
        const todayX = LEFT_WIDTH + todayDay * dayWidth
        const scrollX = todayX - rect.width / 2
        
        container.scrollTo({
          left: Math.max(0, scrollX),
          behavior: 'smooth'
        })
      }
    }

    window.addEventListener('scrollToToday', handleScrollToToday)
    return () => window.removeEventListener('scrollToToday', handleScrollToToday)
  }, [tasks])

  const renderGantt = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 高 DPI 支持
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    // 清空画布
    ctx.clearRect(0, 0, rect.width, rect.height)

    if (tasks.length === 0) {
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('暂无任务数据，请添加任务', rect.width / 2, rect.height / 2)
      return
    }

    // 分离有日期和无日期的任务
    const tasksWithDates = tasks.filter(t => t.startDate)
    const tasksWithoutDates = tasks.filter(t => !t.startDate)
    
    // 调试日志
    console.log('🎨 [GanttChart] 任务统计:', {
      总任务数: tasks.length,
      有日期任务: tasksWithDates.length,
      无日期任务: tasksWithoutDates.length,
      任务列表: tasks.map(t => ({
        name: t.name,
        startDate: t.startDate,
        hasStartDate: !!t.startDate,
        startDateType: typeof t.startDate,
        startDateLength: t.startDate?.length
      }))
    })
    
    // 定义警告条高度
    const WARNING_BAR_HEIGHT = tasksWithoutDates.length > 0 ? 35 : 0

    // 如果没有任何有日期的任务，显示提示
    if (tasksWithDates.length === 0) {
      ctx.fillStyle = '#F59E0B'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⚠️ 所有任务都缺少日期信息', rect.width / 2, rect.height / 2 - 40)
      ctx.fillStyle = '#6B7280'
      ctx.font = '14px sans-serif'
      ctx.fillText('请在任务列表中编辑任务，添加开始日期', rect.width / 2, rect.height / 2 - 10)
      ctx.fillText(`共 ${tasksWithoutDates.length} 个任务需要设置日期`, rect.width / 2, rect.height / 2 + 20)
      return
    }
    
    // 如果有部分任务缺少日期，在表头下方显示统计信息
    if (tasksWithoutDates.length > 0) {
      ctx.fillStyle = '#FEF3C7'
      ctx.fillRect(0, HEADER_HEIGHT, rect.width, WARNING_BAR_HEIGHT)
      
      ctx.fillStyle = '#F59E0B'
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(
        `⚠️ 提示：有 ${tasksWithoutDates.length} 个任务缺少日期信息，已在右侧标记`,
        20,
        HEADER_HEIGHT + WARNING_BAR_HEIGHT / 2 + 5
      )
      
      // 调整后续绘制的起始位置
      currentY = HEADER_HEIGHT + WARNING_BAR_HEIGHT
    }

    // 计算时间范围（只使用有日期的任务）
    const dates = tasksWithDates.flatMap(t => {
      // 处理 ISO 8601 格式和 YYYY-MM-DD 格式
      const start = dayjs(t.startDate)
      const end = t.endDate ? dayjs(t.endDate) : start.add(7, 'day')
      return [start, end]
    })
    
    if (dates.length === 0 || dates.some(d => !d.isValid())) {
      console.error('❌ [GanttChart] 日期解析失败:', {
        dates: tasksWithDates.map(t => ({ name: t.name, startDate: t.startDate, endDate: t.endDate }))
      })
      ctx.fillStyle = '#DC2626'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('❌ 日期格式错误，无法渲染甘特图', rect.width / 2, rect.height / 2)
      return
    }
    
    let minDate = dayjs.min(dates)!
    let maxDate = dayjs.max(dates)!
    
    // 根据时间颗粒度调整范围
    if (ganttConfig.timeScale === 'week') {
      minDate = minDate.startOf('isoWeek').subtract(1, 'week')
      maxDate = maxDate.endOf('isoWeek').add(1, 'week')
    } else if (ganttConfig.timeScale === 'month') {
      minDate = minDate.startOf('month').subtract(1, 'month')
      maxDate = maxDate.endOf('month').add(1, 'month')
    } else {
      minDate = minDate.subtract(3, 'day')
      maxDate = maxDate.add(7, 'day')
    }
    
    const totalDays = maxDate.diff(minDate, 'day') + 1
    
    console.log('📅 [GanttChart] 时间范围:', {
      minDate: minDate.format('YYYY-MM-DD'),
      maxDate: maxDate.format('YYYY-MM-DD'),
      totalDays,
      timeScale: ganttConfig.timeScale
    })

    // 布局常量
    const PHASE_WIDTH = 24
    const TASK_WIDTH = 200
    const ASSIGNEE_WIDTH = 100
    const LEFT_WIDTH = PHASE_WIDTH + TASK_WIDTH + ASSIGNEE_WIDTH
    const ROW_HEIGHT = 42
    const HEADER_HEIGHT = 50
    
    const timelineWidth = rect.width - LEFT_WIDTH
    const dayWidth = timelineWidth / totalDays

    // 按阶段分组任务
    const tasksByPhase = tasks.reduce((acc, task) => {
      if (!acc[task.phase]) acc[task.phase] = []
      acc[task.phase].push(task)
      return acc
    }, {} as Record<string, typeof tasks>)

    const phases = Object.keys(tasksByPhase)
    const today = dayjs()

    // 绘制表头
    ctx.fillStyle = '#F9FAFB'
    ctx.fillRect(0, 0, rect.width, HEADER_HEIGHT)
    
    // 表头边框
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, HEADER_HEIGHT)
    ctx.lineTo(rect.width, HEADER_HEIGHT)
    ctx.stroke()

    // 表头文字
    ctx.fillStyle = '#6B7280'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('阶段', PHASE_WIDTH / 2, 20)
    ctx.fillText('任务', PHASE_WIDTH + TASK_WIDTH / 2, 20)
    ctx.fillText('负责人', PHASE_WIDTH + TASK_WIDTH + ASSIGNEE_WIDTH / 2, 20)

    // 绘制时间轴（根据时间颗粒度）
    ctx.textAlign = 'left'
    
    if (ganttConfig.timeScale === 'day') {
      // 日视图：显示月份和日期
      let currentMonth = -1
      let monthStartX = LEFT_WIDTH
      
      for (let d = 0; d < totalDays; d++) {
        const date = minDate.add(d, 'day')
        const x = LEFT_WIDTH + d * dayWidth
        const month = date.month()
        const dateInfo = getDateInfo(date)
        
        // 月份分隔线
        if (month !== currentMonth) {
          if (currentMonth !== -1) {
            ctx.strokeStyle = '#D1D5DB'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, rect.height)
            ctx.stroke()
            
            // 绘制月份标签
            ctx.fillStyle = '#374151'
            ctx.font = 'bold 11px sans-serif'
            ctx.fillText(`${date.year()}年${month + 1}月`, monthStartX + 4, 18)
          }
          currentMonth = month
          monthStartX = x
        }
        
        // 日期标签
        if (d % 2 === 0 || date.date() === 1) {
          // 根据日期类型设置颜色
          let textColor = '#9CA3AF'
          if (ganttConfig.showHolidays && dateInfo.isHoliday) {
            textColor = '#DC2626' // 节假日红色
          } else if (dateInfo.isWeekend) {
            textColor = '#DC2626' // 周末红色
          } else if (dateInfo.isWorkday) {
            textColor = '#059669' // 调休工作日绿色
          }
          
          ctx.fillStyle = textColor
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(String(date.date()), x + dayWidth / 2, 35)
          
          // 星期或节假日名称
          ctx.font = '8px sans-serif'
          if (ganttConfig.showHolidays && dateInfo.holidayName) {
            ctx.fillStyle = '#DC2626'
            const name = dateInfo.holidayName.length > 3 ? dateInfo.holidayName.substring(0, 3) : dateInfo.holidayName
            ctx.fillText(name, x + dayWidth / 2, 45)
          } else {
            const weekdays = ['日', '一', '二', '三', '四', '五', '六']
            ctx.fillStyle = textColor
            ctx.fillText(weekdays[date.day()], x + dayWidth / 2, 45)
          }
        }
      }
      
      // 绘制最后一个月份标签
      if (monthStartX < rect.width - 100) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'left'
        const lastDate = minDate.add(totalDays - 1, 'day')
        ctx.fillText(`${lastDate.year()}年${lastDate.month() + 1}月`, monthStartX + 4, 18)
      }
      
    } else if (ganttConfig.timeScale === 'week') {
      // 周视图：显示周数
      let currentMonth = -1
      let monthStartX = LEFT_WIDTH
      let weekCount = 0
      
      for (let d = 0; d < totalDays; d++) {
        const date = minDate.add(d, 'day')
        const x = LEFT_WIDTH + d * dayWidth
        const month = date.month()
        const isMonday = date.day() === 1
        
        // 月份分隔线
        if (month !== currentMonth) {
          if (currentMonth !== -1) {
            ctx.strokeStyle = '#D1D5DB'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, rect.height)
            ctx.stroke()
            
            // 绘制月份标签
            ctx.fillStyle = '#374151'
            ctx.font = 'bold 11px sans-serif'
            ctx.fillText(`${date.year()}年${month + 1}月`, monthStartX + 4, 18)
          }
          currentMonth = month
          monthStartX = x
        }
        
        // 周分隔线和标签（每周一）
        if (isMonday) {
          weekCount++
          ctx.strokeStyle = '#E5E7EB'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(x, HEADER_HEIGHT)
          ctx.lineTo(x, rect.height)
          ctx.stroke()
          
          // 周标签
          const weekNum = date.isoWeek()
          ctx.fillStyle = '#6B7280'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`第${weekNum}周`, x + dayWidth * 3.5, 35)
          
          // 日期范围
          const weekEnd = date.add(6, 'day')
          ctx.font = '8px sans-serif'
          ctx.fillStyle = '#9CA3AF'
          ctx.fillText(`${date.format('M/D')}-${weekEnd.format('M/D')}`, x + dayWidth * 3.5, 45)
        }
      }
      
      // 绘制最后一个月份标签
      if (monthStartX < rect.width - 100) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'left'
        const lastDate = minDate.add(totalDays - 1, 'day')
        ctx.fillText(`${lastDate.year()}年${lastDate.month() + 1}月`, monthStartX + 4, 18)
      }
      
    } else if (ganttConfig.timeScale === 'month') {
      // 月视图：显示月份
      let currentYear = -1
      let yearStartX = LEFT_WIDTH
      
      for (let d = 0; d < totalDays; d++) {
        const date = minDate.add(d, 'day')
        const x = LEFT_WIDTH + d * dayWidth
        const year = date.year()
        const isFirstDayOfMonth = date.date() === 1
        
        // 年份分隔线
        if (year !== currentYear) {
          if (currentYear !== -1) {
            ctx.strokeStyle = '#D1D5DB'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, rect.height)
            ctx.stroke()
            
            // 绘制年份标签
            ctx.fillStyle = '#374151'
            ctx.font = 'bold 12px sans-serif'
            ctx.fillText(`${year}年`, yearStartX + 4, 18)
          }
          currentYear = year
          yearStartX = x
        }
        
        // 月份分隔线和标签
        if (isFirstDayOfMonth) {
          ctx.strokeStyle = '#E5E7EB'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(x, HEADER_HEIGHT)
          ctx.lineTo(x, rect.height)
          ctx.stroke()
          
          // 月份标签
          const monthName = `${date.month() + 1}月`
          const daysInMonth = date.daysInMonth()
          const monthWidth = daysInMonth * dayWidth
          
          ctx.fillStyle = '#6B7280'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(monthName, x + monthWidth / 2, 35)
          
          // 天数
          ctx.font = '8px sans-serif'
          ctx.fillStyle = '#9CA3AF'
          ctx.fillText(`${daysInMonth}天`, x + monthWidth / 2, 45)
        }
      }
      
      // 绘制最后一个年份标签
      if (yearStartX < rect.width - 100) {
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'left'
        const lastDate = minDate.add(totalDays - 1, 'day')
        ctx.fillText(`${lastDate.year()}年`, yearStartX + 4, 18)
      }
    }

    // 绘制任务行
    let currentY = HEADER_HEIGHT
    
    phases.forEach((phase, phaseIndex) => {
      const phaseTasks = tasksByPhase[phase]
      const phaseHeight = phaseTasks.length * ROW_HEIGHT
      
      // 阶段背景色
      const phaseColors = [
        { bg: '#ECFDF5', text: '#065F46' },
        { bg: '#EFF6FF', text: '#1E40AF' },
        { bg: '#F5F3FF', text: '#5B21B6' },
        { bg: '#FEF3C7', text: '#92400E' },
        { bg: '#FCE7F3', text: '#9F1239' },
      ]
      const phaseColor = phaseColors[phaseIndex % phaseColors.length]
      
      ctx.fillStyle = phaseColor.bg
      ctx.fillRect(0, currentY, PHASE_WIDTH, phaseHeight)
      
      // 阶段标签（竖排）
      ctx.save()
      ctx.translate(PHASE_WIDTH / 2, currentY + phaseHeight / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillStyle = phaseColor.text
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(phase, 0, 4)
      ctx.restore()
      
      // 绘制该阶段的任务
      phaseTasks.forEach((task, taskIndex) => {
        const rowY = currentY + taskIndex * ROW_HEIGHT
        
        // 行背景（悬停效果由 CSS 处理）
        if (taskIndex % 2 === 0) {
          ctx.fillStyle = '#FAFAFA'
          ctx.fillRect(PHASE_WIDTH, rowY, rect.width - PHASE_WIDTH, ROW_HEIGHT)
        }
        
        // 行分隔线
        ctx.strokeStyle = '#F3F4F6'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(0, rowY + ROW_HEIGHT)
        ctx.lineTo(rect.width, rowY + ROW_HEIGHT)
        ctx.stroke()
        
        // 列分隔线
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(PHASE_WIDTH, rowY)
        ctx.lineTo(PHASE_WIDTH, rowY + ROW_HEIGHT)
        ctx.moveTo(PHASE_WIDTH + TASK_WIDTH, rowY)
        ctx.lineTo(PHASE_WIDTH + TASK_WIDTH, rowY + ROW_HEIGHT)
        ctx.moveTo(LEFT_WIDTH, rowY)
        ctx.lineTo(LEFT_WIDTH, rowY + ROW_HEIGHT)
        ctx.stroke()
        
        // 任务名称
        ctx.fillStyle = '#111827'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(
          task.name.length > 20 ? task.name.substring(0, 20) + '...' : task.name,
          PHASE_WIDTH + 10,
          rowY + ROW_HEIGHT / 2 + 4
        )
        
        // 负责人
        ctx.fillStyle = '#6B7280'
        ctx.font = '11px sans-serif'
        ctx.fillText(
          task.assignee || '未分配',
          PHASE_WIDTH + TASK_WIDTH + 10,
          rowY + ROW_HEIGHT / 2 + 4
        )
        
        // 绘制时间轴网格
        for (let d = 0; d < totalDays; d++) {
          const date = minDate.add(d, 'day')
          const x = LEFT_WIDTH + d * dayWidth
          const dateInfo = getDateInfo(date)
          
          // 节假日和周末背景
          if (ganttConfig.showHolidays && dateInfo.isHoliday) {
            ctx.fillStyle = 'rgba(220, 38, 38, 0.08)' // 节假日红色背景
            ctx.fillRect(x, rowY, dayWidth, ROW_HEIGHT)
          } else if (ganttConfig.showWeekends && dateInfo.isWeekend && !dateInfo.isWorkday) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.02)' // 周末灰色背景
            ctx.fillRect(x, rowY, dayWidth, ROW_HEIGHT)
          } else if (dateInfo.isWorkday) {
            ctx.fillStyle = 'rgba(5, 150, 105, 0.05)' // 调休工作日绿色背景
            ctx.fillRect(x, rowY, dayWidth, ROW_HEIGHT)
          }
          
          // 日期分隔线
          if (date.date() === 1) {
            ctx.strokeStyle = '#D1D5DB'
            ctx.lineWidth = 1
          } else if (date.day() === 1) {
            ctx.strokeStyle = '#E5E7EB'
            ctx.lineWidth = 0.5
          } else {
            ctx.strokeStyle = '#F3F4F6'
            ctx.lineWidth = 0.5
          }
          ctx.beginPath()
          ctx.moveTo(x, rowY)
          ctx.lineTo(x, rowY + ROW_HEIGHT)
          ctx.stroke()
        }
        
        // 检查任务是否有日期
        if (!task.startDate) {
          // 无日期任务：在时间轴右侧绘制警告标记
          const warningX = rect.width - 150
          const warningY = rowY + ROW_HEIGHT / 2
          
          // 绘制虚线框
          ctx.strokeStyle = '#F59E0B'
          ctx.lineWidth = 2
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.roundRect(warningX, warningY - 12, 140, 24, 4)
          ctx.stroke()
          ctx.setLineDash([])
          
          // 填充背景
          ctx.fillStyle = '#FEF3C7'
          ctx.beginPath()
          ctx.roundRect(warningX, warningY - 12, 140, 24, 4)
          ctx.fill()
          
          // 绘制警告图标和文字
          ctx.fillStyle = '#F59E0B'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText('⚠️ 未设置日期', warningX + 8, warningY + 4)
        } else {
          // 有日期的任务：正常绘制任务条
          const startDate = dayjs(task.startDate)
          const endDate = task.endDate ? dayjs(task.endDate) : null
          const startDay = startDate.diff(minDate, 'day')
          const endDay = endDate ? endDate.diff(minDate, 'day') : totalDays - 1
          
          console.log(`📊 [任务条] ${task.name}:`, {
            startDate: task.startDate,
            endDate: task.endDate,
            startDay,
            endDay,
            totalDays,
            willDraw: startDay < totalDays && endDay >= 0
          })
          
          if (startDay < totalDays && endDay >= 0) {
            const barX = LEFT_WIDTH + Math.max(0, startDay) * dayWidth
            const barWidth = (Math.min(endDay, totalDays - 1) - Math.max(0, startDay) + 1) * dayWidth
            const barY = rowY + ROW_HEIGHT / 2 - 9
            const barHeight = 18
            
            console.log(`🎨 [绘制任务条] ${task.name}:`, {
              barX,
              barY,
              barWidth,
              barHeight,
              rowY,
              LEFT_WIDTH,
              dayWidth,
              canvasWidth: rect.width,
              canvasHeight: rect.height
            })
            
            // 获取负责人颜色
            const assigneeColor = getAssigneeColor(task.assignee)
            
            // 里程碑标记（菱形）
            if (task.isMilestone) {
              const centerX = barX + barWidth / 2
              const centerY = rowY + ROW_HEIGHT / 2
              const size = 16
              
              ctx.fillStyle = assigneeColor.bg
              ctx.beginPath()
              ctx.moveTo(centerX, centerY - size / 2)
              ctx.lineTo(centerX + size / 2, centerY)
              ctx.lineTo(centerX, centerY + size / 2)
              ctx.lineTo(centerX - size / 2, centerY)
              ctx.closePath()
              ctx.fill()
              
              // 菱形边框
              ctx.strokeStyle = assigneeColor.text
              ctx.lineWidth = 2
              ctx.stroke()
              
              // 里程碑图标
              ctx.fillStyle = assigneeColor.text
              ctx.font = 'bold 12px sans-serif'
              ctx.textAlign = 'center'
              ctx.fillText('💎', centerX, centerY + 4)
            } else {
              // 普通任务条背景
              ctx.fillStyle = assigneeColor.bg
              if (endDate) {
                ctx.beginPath()
                ctx.roundRect(barX, barY, barWidth, barHeight, 4)
                ctx.fill()
              } else {
                // 进行中的任务（无结束日期）
                ctx.beginPath()
                ctx.roundRect(barX, barY, barWidth + 10, barHeight, [4, 0, 0, 4])
                ctx.fill()
                
                // 箭头
                ctx.fillStyle = assigneeColor.text
                ctx.font = 'bold 13px sans-serif'
                ctx.textAlign = 'left'
                ctx.fillText('→', barX + barWidth + 10, barY + barHeight / 2 + 5)
              }
              
              // 任务条文字（开始日期）
              if (barWidth > 40) {
                ctx.fillStyle = assigneeColor.text
                ctx.font = 'bold 10px sans-serif'
                ctx.textAlign = 'left'
                ctx.fillText(
                  `${startDate.month() + 1}/${startDate.date()}`,
                  barX + 6,
                  barY + barHeight / 2 + 4
                )
              }
            }
          }
        }
      })
      
      currentY += phaseHeight
    })

    // 绘制依赖关系连线
    const taskPositions = new Map<string, { x: number; y: number; width: number }>()
    
    // 先收集所有任务的位置信息
    let posY = HEADER_HEIGHT + WARNING_BAR_HEIGHT
    phases.forEach((phase) => {
      const phaseTasks = tasksByPhase[phase]
      phaseTasks.forEach((task, taskIndex) => {
        const rowY = posY + taskIndex * ROW_HEIGHT
        const startDate = dayjs(task.startDate)
        const endDate = task.endDate ? dayjs(task.endDate) : null
        const startDay = startDate.diff(minDate, 'day')
        const endDay = endDate ? endDate.diff(minDate, 'day') : totalDays - 1
        
        if (startDay < totalDays && endDay >= 0) {
          const barX = LEFT_WIDTH + Math.max(0, startDay) * dayWidth
          const barWidth = (Math.min(endDay, totalDays - 1) - Math.max(0, startDay) + 1) * dayWidth
          const centerY = rowY + ROW_HEIGHT / 2
          
          taskPositions.set(task.id, { x: barX, y: centerY, width: barWidth })
        }
      })
      posY += phaseTasks.length * ROW_HEIGHT
    })
    
    // 绘制依赖关系箭头
    tasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        const toPos = taskPositions.get(task.id)
        if (!toPos) return
        
        task.dependencies.forEach((depId) => {
          const fromPos = taskPositions.get(depId)
          if (!fromPos) return
          
          // 绘制连线：从依赖任务的结束点到当前任务的开始点
          const fromX = fromPos.x + fromPos.width
          const fromY = fromPos.y
          const toX = toPos.x
          const toY = toPos.y
          
          ctx.strokeStyle = '#9CA3AF'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          
          // 绘制折线
          ctx.beginPath()
          ctx.moveTo(fromX, fromY)
          
          // 如果在同一行，直接连接
          if (Math.abs(fromY - toY) < 5) {
            ctx.lineTo(toX, toY)
          } else {
            // 否则绘制折线
            const midX = (fromX + toX) / 2
            ctx.lineTo(midX, fromY)
            ctx.lineTo(midX, toY)
            ctx.lineTo(toX, toY)
          }
          
          ctx.stroke()
          ctx.setLineDash([])
          
          // 绘制箭头
          const arrowSize = 6
          ctx.fillStyle = '#9CA3AF'
          ctx.beginPath()
          ctx.moveTo(toX, toY)
          ctx.lineTo(toX - arrowSize, toY - arrowSize / 2)
          ctx.lineTo(toX - arrowSize, toY + arrowSize / 2)
          ctx.closePath()
          ctx.fill()
        })
      }
    })

    // 绘制今日线
    const todayDay = today.diff(minDate, 'day')
    if (todayDay >= 0 && todayDay < totalDays) {
      const todayX = LEFT_WIDTH + todayDay * dayWidth
      ctx.strokeStyle = '#E24B4A'
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.moveTo(todayX, HEADER_HEIGHT + WARNING_BAR_HEIGHT)
      ctx.lineTo(todayX, currentY)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    console.log('✅ [GanttChart] 渲染完成:', {
      currentY,
      totalHeight: Math.max(currentY, rect.height),
      rectHeight: rect.height
    })
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white overflow-auto">
      <canvas ref={canvasRef} className="block" />
    </div>
  )
})

GanttChart.displayName = 'GanttChart'

export default GanttChart
