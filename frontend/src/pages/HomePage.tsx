import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FileUpload from '../components/FileUpload'
import ParsingProgress from '../components/ParsingProgress'
import FieldMapping from '../components/FieldMapping'
import { parseFile as parseFileUtil, convertToText } from '../utils/fileParser'
import { uploadFile, parseFile, ParseResult } from '../api/upload'
import { useProjectStore } from '../store/projectStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { setTasks } = useProjectStore()
  const [showUpload, setShowUpload] = useState(false)
  const [parsingStatus, setParsingStatus] = useState<
    'uploading' | 'processing' | 'completed' | 'failed' | null
  >(null)
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)

  const handleFileSelect = async (file: File) => {
    setShowUpload(false)
    setFileName(file.name)
    setParsingStatus('uploading')
    setProgress(0)
    setError(null)

    try {
      // 1. 客户端解析文件
      setProgress(20)
      const parsedData = await parseFileUtil(file)
      const fileContent = convertToText(parsedData)

      // 2. 上传文件
      setProgress(40)
      const uploadResponse = await uploadFile(file)

      // 3. 触发 AI 解析
      setParsingStatus('processing')
      setProgress(60)

      const parseResponse = await parseFile(uploadResponse.id, fileContent)

      setProgress(100)

      if (parseResponse.status === 'completed' && parseResponse.result) {
        setParseResult(parseResponse.result)
        setParsingStatus('completed')

        // 延迟显示字段映射界面
        setTimeout(() => {
          setParsingStatus(null)
        }, 1000)
      } else if (parseResponse.status === 'failed') {
        throw new Error(parseResponse.errorMessage || '解析失败')
      }
    } catch (err: any) {
      console.error('File parsing error:', err)
      setError(err.message || '文件解析失败，请重试')
      setParsingStatus('failed')
    }
  }

  const handleMappingConfirm = (updatedMapping: Record<string, string>) => {
    if (!parseResult) return

    // 将解析结果转换为任务列表
    const tasks = parseResult.tasks.map((task, index) => ({
      id: `task_${Date.now()}_${index}`,
      projectId: 'temp',
      name: task.name,
      startDate: task.startDate,
      endDate: task.endDate,
      assignee: task.assignee,
      phase: task.phase,
      description: task.description,
      isMilestone: false,
      dependencies: [],
      position: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // 保存到状态
    setTasks(tasks)

    // 跳转到编辑器
    navigate('/editor/new')
  }

  const handleMappingCancel = () => {
    setParseResult(null)
  }

  const handleRetry = () => {
    setParsingStatus(null)
    setShowUpload(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">GanttFlow</h1>
          <p className="text-xl text-gray-600 mb-8">
            在线甘特图协作工具 · AI 智能解析项目文件
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/editor/new"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              创建项目
            </Link>
            <button
              onClick={() => setShowUpload(true)}
              className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
            >
              📤 上传文件
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">双轨输入</h3>
            <p className="text-gray-600">手动填写或上传 Excel/Word，AI 自动解析</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">可视化编辑</h3>
            <p className="text-gray-600">所见即所得的甘特图编辑器</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">一键分享</h3>
            <p className="text-gray-600">生成专属链接，无需注册即可查看</p>
          </div>
        </div>

        {/* 功能亮点 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            🤖 AI 智能解析，30 秒生成甘特图
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">支持的文件格式</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Excel (.xlsx, .xls)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Word (.docx)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    CSV 文件
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">智能识别字段</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    任务名称与描述
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    开始/结束日期
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    负责人与阶段
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 文件上传弹窗 */}
      {showUpload && (
        <FileUpload onFileSelect={handleFileSelect} onClose={() => setShowUpload(false)} />
      )}

      {/* 解析进度 */}
      {parsingStatus && (
        <ParsingProgress
          status={parsingStatus}
          fileName={fileName}
          progress={progress}
          error={error || undefined}
          onRetry={handleRetry}
          onClose={() => setParsingStatus(null)}
        />
      )}

      {/* 字段映射 */}
      {parseResult && !parsingStatus && (
        <FieldMapping
          parseResult={parseResult}
          onConfirm={handleMappingConfirm}
          onCancel={handleMappingCancel}
        />
      )}
    </div>
  )
}
