import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import GanttChart from '../components/GanttChart'
import GanttControls from '../components/GanttControls'
import ShareDialog from '../components/ShareDialog'
import ExportDialog from '../components/ExportDialog'
import FileUploadWithParsing from '../components/FileUploadWithParsing'
import { Task } from '../types'
import { getProject, createProject, updateProject } from '../api/projects'
import { isAuthenticated } from '../api/auth'
import type { ParseResult } from '../api/upload'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProject, setProject, isSaving, lastSaved, saveProject } = useProjectStore()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [projectName, setProjectName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    loadProject()
  }, [id])

  // 自动保存机制（30秒防抖）
  useEffect(() => {
    if (!currentProject || currentProject.id.startsWith('temp_')) {
      return
    }

    const autoSaveTimer = setTimeout(() => {
      saveProject().catch(err => {
        console.error('自动保存失败:', err)
      })
    }, 30000) // 30秒后自动保存

    return () => clearTimeout(autoSaveTimer)
  }, [currentProject, saveProject])

  const loadProject = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (id === 'new') {
        // 创建新项目
        const newProject = {
          id: `temp_${Date.now()}`,
          userId: 'temp_user',
          name: '未命名项目',
          description: '',
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setProject(newProject)
        setProjectName(newProject.name)
      } else if (id) {
        // 加载现有项目
        const project = await getProject(id)
        setProject(project)
        setProjectName(project.name)
      }
    } catch (err: any) {
      console.error('加载项目失败:', err)
      setError(err.message || '加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleNameEdit = () => {
    setEditingName(true)
  }

  const handleNameSave = async () => {
    if (!currentProject || !projectName.trim()) {
      setEditingName(false)
      return
    }

    try {
      setProject({ ...currentProject, name: projectName.trim() })
      setEditingName(false)

      // 如果不是临时项目，立即保存
      if (!currentProject.id.startsWith('temp_')) {
        await saveProject()
      }
    } catch (err) {
      console.error('保存项目名称失败:', err)
    }
  }

  const handleNameCancel = () => {
    setProjectName(currentProject?.name || '')
    setEditingName(false)
  }

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
    if (!currentProject) return

    try {
      if (currentProject.id.startsWith('temp_')) {
        // 新项目，需要先创建
        const created = await createProject({
          name: currentProject.name,
          description: currentProject.description || '',
        })
        
        // 更新项目 ID
        setProject({ ...currentProject, id: created.id })
        
        // 保存任务
        if (currentProject.tasks.length > 0) {
          await updateProject(created.id, {
            name: currentProject.name,
            description: currentProject.description,
            tasks: currentProject.tasks,
          })
        }
        
        // 更新 URL
        navigate(`/editor/${created.id}`, { replace: true })
      } else {
        // 更新现有项目
        await saveProject()
      }
    } catch (err: any) {
      console.error('保存失败:', err)
      alert('保存失败: ' + (err.message || '未知错误'))
    }
  }

  const handleFileUploadComplete = (result: ParseResult) => {
    if (!currentProject) return

    // 将解析结果转换为任务
    const newTasks: Task[] = result.tasks.map((task, index) => ({
      id: `task_${Date.now()}_${index}`,
      projectId: currentProject.id,
      name: task.name,
      startDate: task.startDate,
      endDate: task.endDate || task.startDate,
      assignee: task.assignee,
      phase: task.phase,
      description: task.description,
      status: 'pending' as const,
      progress: 0,
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // 更新项目任务
    setProject({
      ...currentProject,
      tasks: [...currentProject.tasks, ...newTasks],
    })

    setShowFileUpload(false)
  }

  const handleShare = () => {
    setShowShareDialog(true)
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 加载状态 */}
      {loading && (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-on-surface-variant">加载中...</p>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
            <h2 className="text-headline-sm text-on-surface mb-2">加载失败</h2>
            <p className="text-body-md text-on-surface-variant mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      )}

      {/* 正常内容 */}
      {!loading && !error && currentProject && (
        <>
          {/* 顶部工具栏 */}
          <header className="bg-surface-container-low border-b border-surface-container px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                title="返回首页"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNameSave()
                        if (e.key === 'Escape') handleNameCancel()
                      }}
                      className="px-3 py-1 bg-surface-container-highest text-on-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-headline-sm font-headline"
                      autoFocus
                    />
                    <button
                      onClick={handleNameSave}
                      className="p-1 text-primary hover:bg-surface-container rounded-lg transition-colors"
                      title="保存"
                    >
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                    <button
                      onClick={handleNameCancel}
                      className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                      title="取消"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-headline-sm font-headline text-on-surface">
                      {currentProject.name}
                    </h1>
                    <button
                      onClick={handleNameEdit}
                      className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all"
                      title="编辑项目名称"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                )}
                {lastSaved && (
                  <p className="text-label-sm text-on-surface-variant">
                    {isSaving ? '保存中...' : `上次保存: ${lastSaved.toLocaleTimeString()}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFileUpload(true)}
                className="px-4 py-2 text-on-surface hover:bg-surface-container rounded-xl transition-all flex items-center gap-2"
                title="上传文件"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span className="hidden md:inline">上传文件</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-on-surface hover:bg-surface-container rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span className="hidden md:inline">{isSaving ? '保存中...' : '保存'}</span>
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 text-on-surface hover:bg-surface-container rounded-xl transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span className="hidden md:inline">导出</span>
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
                <span className="hidden md:inline">分享</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* 左侧任务面板 */}
            <aside className="w-80 bg-surface-container-lowest border-r border-surface-container flex flex-col">
              <div className="p-4 border-b border-surface-container">
                <button
                  onClick={handleNewTask}
                  className="w-full px-4 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  新建任务
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <TaskList onEditTask={handleEditTask} />
              </div>
            </aside>

            {/* 右侧甘特图区域 */}
            <main className="flex-1 flex flex-col overflow-hidden bg-surface">
              <GanttControls />
              <div className="flex-1 overflow-auto p-4">
                <GanttChart ref={canvasRef} />
              </div>
            </main>
          </div>

          {/* 任务表单弹窗 */}
          {showTaskForm && <TaskForm task={editingTask} onClose={handleCloseForm} />}

          {/* 分享对话框 */}
          {showShareDialog && (
            <ShareDialog
              projectId={currentProject.id}
              projectName={currentProject.name}
              onClose={() => setShowShareDialog(false)}
            />
          )}

          {/* 导出对话框 */}
          {showExportDialog && (
            <ExportDialog canvasRef={canvasRef} onClose={() => setShowExportDialog(false)} />
          )}

          {/* 文件上传对话框 */}
          {showFileUpload && (
            <FileUploadWithParsing
              onClose={() => setShowFileUpload(false)}
              onComplete={handleFileUploadComplete}
            />
          )}
        </>
      )}
    </div>
  )
}
