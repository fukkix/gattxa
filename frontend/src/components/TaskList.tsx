import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { Task } from '../types'
import { groupTasksByPhase } from '../utils/ganttRenderer'

interface TaskListProps {
  onEditTask: (task: Task) => void
}

export default function TaskList({ onEditTask }: TaskListProps) {
  const { tasks, deleteTask, ganttConfig } = useProjectStore()
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无任务</p>
        <p className="text-sm mt-2">点击上方"新建任务"按钮开始</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Object.entries(groupedTasks).map(([phase, phaseTasks]) => {
        const isExpanded = expandedPhases.has(phase)
        const phaseColor = ganttConfig.colorScheme[phase] || '#6b7280'

        return (
          <div key={phase} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* 阶段标题 */}
            <button
              onClick={() => togglePhase(phase)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: phaseColor }}
                />
                <span className="font-medium text-gray-900">{phase}</span>
                <span className="text-sm text-gray-500">({phaseTasks.length})</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 任务列表 */}
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {phaseTasks.map(task => (
                  <div
                    key={task.id}
                    className="px-4 py-3 hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.name}
                          </h4>
                          {task.isMilestone && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              里程碑
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>📅 {task.startDate}</span>
                          {task.endDate && <span>→ {task.endDate}</span>}
                          {task.assignee && <span>👤 {task.assignee}</span>}
                        </div>
                        {task.description && (
                          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="编辑"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(task.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* 删除确认对话框 */}
                    {deleteConfirm === task.id && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800 mb-2">确定要删除这个任务吗？</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            确定删除
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
