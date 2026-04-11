// 测试数据生成器
import dayjs from 'dayjs'
import { Task } from '../types'

const phases = ['需求分析', '设计阶段', '开发阶段', '测试阶段', '部署上线']
const assignees = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
const taskPrefixes = ['开发', '设计', '测试', '优化', '修复', '实现', '调研', '评审']
const taskSuffixes = ['功能', '模块', '组件', '接口', '页面', '服务', '系统', '流程']

export function generateTestTasks(count: number): Omit<Task, 'id'>[] {
  const tasks: Omit<Task, 'id'>[] = []
  const startDate = dayjs().subtract(30, 'day')

  for (let i = 0; i < count; i++) {
    const phase = phases[i % phases.length]
    const assignee = assignees[i % assignees.length]
    const prefix = taskPrefixes[Math.floor(Math.random() * taskPrefixes.length)]
    const suffix = taskSuffixes[Math.floor(Math.random() * taskSuffixes.length)]
    
    const taskStartDate = startDate.add(Math.floor(i / 10), 'day')
    const duration = Math.floor(Math.random() * 10) + 3 // 3-12 天
    const taskEndDate = taskStartDate.add(duration, 'day')
    
    // 10% 的任务是里程碑
    const isMilestone = Math.random() < 0.1
    
    // 20% 的任务进行中（无结束日期）
    const isInProgress = Math.random() < 0.2 && !isMilestone
    
    tasks.push({
      name: `${prefix}${suffix} ${i + 1}`,
      startDate: taskStartDate.format('YYYY-MM-DD'),
      endDate: isInProgress ? undefined : taskEndDate.format('YYYY-MM-DD'),
      assignee,
      phase,
      description: `这是第 ${i + 1} 个测试任务`,
      isMilestone,
      dependencies: [],
      order: i
    })
  }

  // 添加一些依赖关系
  for (let i = 10; i < Math.min(count, 50); i += 10) {
    if (i > 0) {
      tasks[i].dependencies = [String(i - 5)]
    }
  }

  return tasks
}

export function measurePerformance(label: string, fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  const duration = end - start
  console.log(`[性能测试] ${label}: ${duration.toFixed(2)}ms`)
  return duration
}
