import { useState } from 'react'

interface Task {
  id: string
  name: string
  startDate: string | null
  endDate: string | null
  assignee: string
  phase: string
  description?: string
  version: number
  updatedAt: string
}

interface ConflictDialogProps {
  localTask: Task
  remoteTask: Task
  onResolve: (resolution: 'local' | 'remote' | 'merge', mergedTask?: Partial<Task>) => void
  onCancel: () => void
}

export default function ConflictDialog({
  localTask,
  remoteTask,
  onResolve,
  onCancel,
}: ConflictDialogProps) {
  const [resolution, setResolution] = useState<'local' | 'remote' | 'merge'>('remote')
  const [mergedTask, setMergedTask] = useState<Partial<Task>>({
    name: remoteTask.name,
    startDate: remoteTask.startDate,
    endDate: remoteTask.endDate,
    assignee: remoteTask.assignee,
    phase: remoteTask.phase,
    description: remoteTask.description,
  })

  const handleFieldSelect = (field: keyof Task, source: 'local' | 'remote') => {
    setMergedTask((prev) => ({
      ...prev,
      [field]: source === 'local' ? localTask[field] : remoteTask[field],
    }))
  }

  const handleResolve = () => {
    if (resolution === 'merge') {
      onResolve('merge', mergedTask)
    } else {
      onResolve(resolution)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '未设置'
    return new Date(date).toLocaleDateString('zh-CN')
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-high rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-surface-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[32px] text-error">
              warning
            </span>
            <div>
              <h2 className="text-headline-md font-headline text-on-surface">
                检测到编辑冲突
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                任务 "{localTask.name}" 已被其他用户修改，请选择如何解决冲突
              </p>
            </div>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 解决方案选择 */}
          <div className="mb-6">
            <h3 className="text-title-md font-medium text-on-surface mb-3">
              选择解决方案
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setResolution('local')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  resolution === 'local'
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container hover:border-surface-container-highest'
                }`}
              >
                <div className="text-center">
                  <span className="material-symbols-outlined text-[32px] text-primary mb-2">
                    person
                  </span>
                  <p className="text-title-sm font-medium text-on-surface">
                    保留我的更改
                  </p>
                  <p className="text-label-sm text-on-surface-variant mt-1">
                    覆盖远程更改
                  </p>
                </div>
              </button>

              <button
                onClick={() => setResolution('remote')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  resolution === 'remote'
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container hover:border-surface-container-highest'
                }`}
              >
                <div className="text-center">
                  <span className="material-symbols-outlined text-[32px] text-tertiary mb-2">
                    cloud
                  </span>
                  <p className="text-title-sm font-medium text-on-surface">
                    使用远程更改
                  </p>
                  <p className="text-label-sm text-on-surface-variant mt-1">
                    放弃我的更改
                  </p>
                </div>
              </button>

              <button
                onClick={() => setResolution('merge')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  resolution === 'merge'
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container hover:border-surface-container-highest'
                }`}
              >
                <div className="text-center">
                  <span className="material-symbols-outlined text-[32px] text-secondary mb-2">
                    merge
                  </span>
                  <p className="text-title-sm font-medium text-on-surface">
                    手动合并
                  </p>
                  <p className="text-label-sm text-on-surface-variant mt-1">
                    选择每个字段
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 手动合并选项 */}
          {resolution === 'merge' && (
            <div className="space-y-4">
              <h3 className="text-title-md font-medium text-on-surface mb-3">
                选择要保留的值
              </h3>

              {/* 任务名称 */}
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-label-md font-medium text-on-surface mb-2">
                  任务名称
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFieldSelect('name', 'local')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.name === localTask.name
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      我的版本
                    </p>
                    <p className="text-body-md text-on-surface">{localTask.name}</p>
                  </button>
                  <button
                    onClick={() => handleFieldSelect('name', 'remote')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.name === remoteTask.name
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      远程版本
                    </p>
                    <p className="text-body-md text-on-surface">{remoteTask.name}</p>
                  </button>
                </div>
              </div>

              {/* 开始日期 */}
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-label-md font-medium text-on-surface mb-2">
                  开始日期
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFieldSelect('startDate', 'local')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.startDate === localTask.startDate
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      我的版本
                    </p>
                    <p className="text-body-md text-on-surface">
                      {formatDate(localTask.startDate)}
                    </p>
                  </button>
                  <button
                    onClick={() => handleFieldSelect('startDate', 'remote')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.startDate === remoteTask.startDate
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      远程版本
                    </p>
                    <p className="text-body-md text-on-surface">
                      {formatDate(remoteTask.startDate)}
                    </p>
                  </button>
                </div>
              </div>

              {/* 结束日期 */}
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-label-md font-medium text-on-surface mb-2">
                  结束日期
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFieldSelect('endDate', 'local')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.endDate === localTask.endDate
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      我的版本
                    </p>
                    <p className="text-body-md text-on-surface">
                      {formatDate(localTask.endDate)}
                    </p>
                  </button>
                  <button
                    onClick={() => handleFieldSelect('endDate', 'remote')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.endDate === remoteTask.endDate
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      远程版本
                    </p>
                    <p className="text-body-md text-on-surface">
                      {formatDate(remoteTask.endDate)}
                    </p>
                  </button>
                </div>
              </div>

              {/* 负责人 */}
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-label-md font-medium text-on-surface mb-2">
                  负责人
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFieldSelect('assignee', 'local')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.assignee === localTask.assignee
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      我的版本
                    </p>
                    <p className="text-body-md text-on-surface">{localTask.assignee}</p>
                  </button>
                  <button
                    onClick={() => handleFieldSelect('assignee', 'remote')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.assignee === remoteTask.assignee
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      远程版本
                    </p>
                    <p className="text-body-md text-on-surface">{remoteTask.assignee}</p>
                  </button>
                </div>
              </div>

              {/* 阶段 */}
              <div className="bg-surface-container rounded-xl p-4">
                <p className="text-label-md font-medium text-on-surface mb-2">
                  阶段
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFieldSelect('phase', 'local')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.phase === localTask.phase
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      我的版本
                    </p>
                    <p className="text-body-md text-on-surface">{localTask.phase}</p>
                  </button>
                  <button
                    onClick={() => handleFieldSelect('phase', 'remote')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      mergedTask.phase === remoteTask.phase
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-highest hover:border-surface-container-high'
                    }`}
                  >
                    <p className="text-label-sm text-on-surface-variant mb-1">
                      远程版本
                    </p>
                    <p className="text-body-md text-on-surface">{remoteTask.phase}</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 版本信息 */}
          <div className="mt-6 p-4 bg-surface-container rounded-xl">
            <h3 className="text-title-sm font-medium text-on-surface mb-2">
              版本信息
            </h3>
            <div className="grid grid-cols-2 gap-4 text-body-sm">
              <div>
                <p className="text-on-surface-variant">我的版本</p>
                <p className="text-on-surface">
                  版本 {localTask.version} · {formatTime(localTask.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant">远程版本</p>
                <p className="text-on-surface">
                  版本 {remoteTask.version} · {formatTime(remoteTask.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-surface-container flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-on-surface hover:bg-surface-container rounded-xl transition-all"
          >
            取消
          </button>
          <button
            onClick={handleResolve}
            className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all"
          >
            解决冲突
          </button>
        </div>
      </div>
    </div>
  )
}
