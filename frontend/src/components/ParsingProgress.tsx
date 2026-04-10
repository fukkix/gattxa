interface ParsingProgressProps {
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  fileName: string
  progress?: number
  error?: string
  onRetry?: () => void
  onClose?: () => void
}

export default function ParsingProgress({
  status,
  fileName,
  progress = 0,
  error,
  onRetry,
  onClose,
}: ParsingProgressProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: '📤',
          title: '上传中...',
          description: '正在上传文件到服务器',
          color: 'blue',
        }
      case 'processing':
        return {
          icon: '🤖',
          title: 'AI 解析中...',
          description: '正在智能识别任务信息',
          color: 'indigo',
        }
      case 'completed':
        return {
          icon: '✅',
          title: '解析完成',
          description: '文件解析成功，即将跳转',
          color: 'green',
        }
      case 'failed':
        return {
          icon: '❌',
          title: '解析失败',
          description: error || '文件解析失败，请重试',
          color: 'red',
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{statusInfo.title}</h3>
          <p className="text-sm text-gray-600 mb-6">{statusInfo.description}</p>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 truncate">{fileName}</p>
          </div>

          {(status === 'uploading' || status === 'processing') && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-${statusInfo.color}-600 transition-all duration-300 ease-out`}
                  style={{ width: `${progress}%` }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{progress}%</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200" />
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="flex gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    重试
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                  >
                    关闭
                  </button>
                )}
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="flex items-center justify-center">
              <svg
                className="w-16 h-16 text-green-500 animate-checkmark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes checkmark {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-checkmark {
          animation: checkmark 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
