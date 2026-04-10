import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import GanttChart from '../components/GanttChart'
import GanttControls from '../components/GanttControls'
import { Task } from '../types'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProject, setProject, isSaving, lastSaved } = useProjectStore()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    // TODO: 从 API 加载项目数据
    // 临时使用模拟数据
    if (id === 'new') {
      setProject({
        id: `project_${Date.now()}`,
        userId: 'temp_user',
        name: '新项目',
        description: '',
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }, [id, setProject])

  const handleNewTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleSave = async () => {
    // TODO: 实现保存到后端
    console.log('保存项目')
  }

  const handleShare = () => {
    // TODO: 实现分享功能
    console.log('生成分享链接')
  }

  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出甘特图')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
            title="返回首页"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {currentProject?.name || '加载中...'}
            </h1>
            {lastSaved && (
              <p className="text-xs text-gray-500">
                {isSaving ? '保存中...' : `上次保存: ${lastSaved.toLocaleTimeString()}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '💾 保存'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            📤 导出
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            🔗 分享
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧任务面板 */}
        <aside className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <button
              onClick={handleNewTask}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新建任务
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <TaskList onEditTask={handleEditTask} />
          </div>
        </aside>

        {/* 右侧甘特图区域 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <GanttControls />
          <div className="flex-1 overflow-auto p-4">
            <GanttChart />
          </div>
        </main>
      </div>

      {/* 任务表单弹窗 */}
      {showTaskForm && <TaskForm task={editingTask} onClose={handleCloseForm} />}
    </div>
  )
}
