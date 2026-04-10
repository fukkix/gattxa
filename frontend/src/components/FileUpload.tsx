import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import AISettingsDialog, { hasAISettings } from './AISettingsDialog'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onClose: () => void
}

export default function FileUpload({ onFileSelect, onClose }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [showAISettings, setShowAISettings] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('文件大小超过 20MB 限制')
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('不支持的文件类型，仅支持 .xlsx, .xls, .docx, .csv')
        } else {
          setError('文件上传失败，请重试')
        }
        return
      }

      if (acceptedFiles.length > 0) {
        // 检查是否已配置 AI
        if (!hasAISettings()) {
          setError('请先配置 AI 设置')
          setShowAISettings(true)
          return
        }
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false,
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">上传项目文件</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center">
            <svg
              className={`w-16 h-16 mb-4 ${
                isDragActive ? 'text-indigo-500' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {isDragActive ? (
              <p className="text-lg text-indigo-600 font-medium">松开鼠标上传文件</p>
            ) : (
              <>
                <p className="text-lg text-gray-700 font-medium mb-2">
                  拖拽文件到这里，或点击选择文件
                </p>
                <p className="text-sm text-gray-500">
                  支持 Excel (.xlsx, .xls)、Word (.docx)、CSV 文件
                </p>
                <p className="text-xs text-gray-400 mt-1">文件大小限制：20MB</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 文件格式建议</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 确保文件包含任务名称、开始日期、结束日期等关键信息</li>
            <li>• 使用清晰的列标题（如"任务名称"、"开始时间"、"负责人"）</li>
            <li>• 日期格式建议：YYYY-MM-DD 或 YYYY年MM月DD日</li>
            <li>• 避免合并单元格和复杂的嵌套结构</li>
          </ul>
        </div>

        {!hasAISettings() && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 mb-2">
                  需要配置 AI 设置
                </p>
                <p className="text-sm text-amber-800 mb-3">
                  AI 文件解析功能需要您提供自己的 API Key。您的 Key 仅存储在本地浏览器中。
                </p>
                <button
                  onClick={() => setShowAISettings(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-all"
                >
                  配置 AI 设置
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setShowAISettings(true)}
            className="px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-xl transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            AI 设置
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            取消
          </button>
        </div>
      </div>

      {/* AI Settings Dialog */}
      {showAISettings && (
        <AISettingsDialog
          onClose={() => setShowAISettings(false)}
          onSave={() => {
            setError(null)
            setShowAISettings(false)
          }}
        />
      )}
    </div>
  )
}
