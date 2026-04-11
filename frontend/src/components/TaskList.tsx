import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { Task } from '../types'
import { groupTasksByPhase } from '../utils/ganttRenderer'
import CommentSection from './CommentSection'

interface TaskListProps {
  onEditTask: (task: Task) => void
}

export default function TaskList({ onEditTask }: TaskListProps) {
  const { tasks, deleteTask, ganttConfig, reorderTasks } = useProjectStore()
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverTask, setDragOverTask] = useState<string | null>(null)
  const [commentingTask, setCommentingTask] = useState<Task | null>(null)

  const groupedTasks = groupTasksByPhase(tasks)

  const togglePhase = (phase: string) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase)
    } else {
      newExpanded.add(phase)
    }
    setExpandedPhases(newExpanded)
  }

  const handleDelete = (taskId: string) => {
    deleteTask(taskId)
    setDeleteConfirm(null)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', taskId)
  }

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTask(taskId)
  }

  const handleDragLeave = () => {
    setDragOverTask(null)
  }

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask === targetTaskId) {
      setDraggedTask(null)
      setDragOverTask(null)
      return
    }

    // 重新排序任务
    const draggedIndex = tasks.findIndex(t => t.id === draggedTask)
    const targetIndex = tasks.findIndex(t => t.id === targetTaskId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTask(null)
      setDragOverTask(null)
      return
    }

    const newTasks = [...tasks]
    const [removed] = newTasks.splice(draggedIndex, 1)
    newTasks.splice(targetIndex, 0, removed)

    reorderTasks(newTasks)
    setDraggedTask(null)
    setDragOverTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverTask(null)
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl mb-4 block">task_alt</span>
        <p className="text-body-lg">暂无任务</p>
        <p className="text-body-sm mt-2">点击上方"新建任务"按钮开始</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Object.entries(groupedTasks).map(([phase, phaseTasks]) => {
        const isExpanded = expandedPhases.has(phase)
        const phaseColor = ganttConfig.colorScheme[phase] || '#6b7280'

        return (
          <div key={phase} className="border border-surface-container rounded-2xl overflow-hidden">
            {/* 阶段标题 */}
            <button
              onClick={() => togglePhase(phase)}
              className="w-full px-4 py-3 bg-surface-container-low hover:bg-surface-container flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: phaseColor }}
                />
                <span className="font-medium text-on-surface">{phase}</span>
                <span className="text-label-sm text-on-surface-variant">
                  ({phaseTasks.length})
                </span>
              </div>
              <span
                className={`material-symbols-outlined text-on-surface-variant transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {/* 任务列表 */}
            {isExpanded && (
              <div className="divide-y divide-surface-container">
                {phaseTasks.map(task => {
                  const isDragging = draggedTask === task.id
                  const isDragOver = dragOverTask === task.id

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragOver={(e) => handleDragOver(e, task.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`px-4 py-3 transition group cursor-move ${
                        isDragging ? 'opacity-50' : ''
                      } ${
                        isDragOver ? 'bg-primary-container border-t-2 border-primary' : 'hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* 拖拽手柄 */}
                          <div className="mt-1 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                            <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-body-md font-medium text-on-surface truncate">
                                {task.name}
                              </h4>
                              {task.isMilestone && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm bg-tertiary-container text-on-tertiary-container">
                                  里程碑
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-label-sm text-on-surface-variant">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                {task.startDate}
                              </span>
                              {task.endDate && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                  {task.endDate}
                                </span>
                              )}
                              {task.assignee && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">person</span>
                                  {task.assignee}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="mt-1 text-body-sm text-on-surface-variant line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setCommentingTask(task)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-lg transition-all"
                            title="评论"
                          >
                            <span className="material-symbols-outlined text-[20px]">comment</span>
                          </button>
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-lg transition-all"
                            title="编辑"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(task.id)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-all"
                            title="删除"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* 删除确认对话框 */}
                      {deleteConfirm === task.id && (
                        <div className="mt-3 p-3 bg-error-container border border-error rounded-xl">
                          <p className="text-body-sm text-on-error-container mb-2">
                            确定要删除这个任务吗？
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="px-4 py-2 text-label-md text-on-error bg-error rounded-xl hover:opacity-90 transition-all"
                            >
                              确定删除
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 text-label-md text-on-surface bg-surface-container-highest rounded-xl hover:bg-surface-container transition-all"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* 评论对话框 */}
      {commentingTask && (
        <CommentSection
          task={commentingTask}
          onClose={() => setCommentingTask(null)}
        />
      )}
    </div>
  )
}
