import { useState } from 'react'
import { exportToPNG, exportToCSV, exportToJSON, exportToPDF } from '../utils/exportUtils'
import { useProjectStore } from '../store/projectStore'

interface ExportDialogProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  onClose: () => void
}

export default function ExportDialog({ canvasRef, onClose }: ExportDialogProps) {
  const { currentProject, tasks } = useProjectStore()
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'png' | 'pdf' | 'csv' | 'json'>('png')

  const handleExport = async () => {
    if (!currentProject) return

    setExporting(true)
    try {
      const projectName = currentProject.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
      const timestamp = new Date().toISOString().split('T')[0]

      switch (exportType) {
        case 'png':
          if (canvasRef.current) {
            await exportToPNG(canvasRef.current, `${projectName}_甘特图_${timestamp}.png`)
          }
          break
        case 'pdf':
          if (canvasRef.current) {
            await exportToPDF(currentProject.name, tasks, canvasRef.current, `${projectName}_${timestamp}.pdf`)
          }
          break
        case 'csv':
          exportToCSV(tasks, `${projectName}_任务列表_${timestamp}.csv`)
          break
        case 'json':
          exportToJSON(currentProject.name, tasks, `${projectName}_${timestamp}.json`)
          break
      }

      // 延迟关闭以显示成功状态
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">导出项目</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            选择导出格式
          </p>

          <div className="space-y-3">
            {/* PNG 选项 */}
            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="exportType"
                value="png"
                checked={exportType === 'png'}
                onChange={e => setExportType(e.target.value as any)}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🖼️</span>
                  <span className="font-medium text-gray-900">PNG 图片</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  导出高清甘特图图片（2x 分辨率），适合打印和分享
                </p>
              </div>
            </label>

            {/* PDF 选项 */}
            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="exportType"
                value="pdf"
                checked={exportType === 'pdf'}
                onChange={e => setExportType(e.target.value as any)}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📑</span>
                  <span className="font-medium text-gray-900">PDF 文档</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  导出完整 PDF 文档，包含甘特图和任务列表
                </p>
              </div>
            </label>

            {/* CSV 选项 */}
            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="exportType"
                value="csv"
                checked={exportType === 'csv'}
                onChange={e => setExportType(e.target.value as any)}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <span className="font-medium text-gray-900">CSV 表格</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  导出任务列表为 CSV 文件，可在 Excel 中打开编辑
                </p>
              </div>
            </label>

            {/* JSON 选项 */}
            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="exportType"
                value="json"
                checked={exportType === 'json'}
                onChange={e => setExportType(e.target.value as any)}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <span className="font-medium text-gray-900">JSON 数据</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  导出完整项目数据为 JSON 格式，便于备份和迁移
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                导出中...
              </>
            ) : (
              <>
                📤 导出
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
