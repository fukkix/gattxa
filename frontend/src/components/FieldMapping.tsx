import { useState } from 'react'
import { ParseResult } from '../api/upload'

interface FieldMappingProps {
  parseResult: ParseResult
  onConfirm: (updatedMapping: Record<string, string>) => void
  onCancel: () => void
}

const SYSTEM_FIELDS = [
  { value: 'name', label: '任务名称' },
  { value: 'startDate', label: '开始日期' },
  { value: 'endDate', label: '结束日期' },
  { value: 'assignee', label: '负责人' },
  { value: 'phase', label: '所属阶段' },
  { value: 'description', label: '任务说明' },
  { value: 'ignore', label: '忽略此列' },
]

export default function FieldMapping({ parseResult, onConfirm, onCancel }: FieldMappingProps) {
  const [fieldMapping, setFieldMapping] = useState(parseResult.fieldMapping)
  const [previewIndex, setPreviewIndex] = useState(0)

  const handleMappingChange = (originalField: string, newMapping: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [originalField]: newMapping,
    }))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50'
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return '高'
    if (confidence >= 0.5) return '中'
    return '低'
  }

  const previewTask = parseResult.tasks[previewIndex]
  const lowConfidenceTasks = parseResult.tasks.filter(t => t.confidence < 0.9)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">确认字段映射</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI 已自动识别字段，请确认或调整映射关系
          </p>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 警告信息 */}
          {lowConfidenceTasks.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 mt-0.5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    发现 {lowConfidenceTasks.length} 个低置信度任务
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    建议检查这些任务的字段映射是否正确
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 字段映射表格 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">字段映射关系</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      原始列名
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      映射到
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(fieldMapping).map(([originalField, mappedField]) => (
                    <tr key={originalField} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{originalField}</td>
                      <td className="px-4 py-3">
                        <select
                          value={mappedField}
                          onChange={e => handleMappingChange(originalField, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {SYSTEM_FIELDS.map(field => (
                            <option key={field.value} value={field.value}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 预览区域 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">数据预览</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                  disabled={previewIndex === 0}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-sm text-gray-600">
                  {previewIndex + 1} / {parseResult.tasks.length}
                </span>
                <button
                  onClick={() =>
                    setPreviewIndex(Math.min(parseResult.tasks.length - 1, previewIndex + 1))
                  }
                  disabled={previewIndex === parseResult.tasks.length - 1}
                  className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{previewTask.name}</h4>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getConfidenceColor(
                    previewTask.confidence
                  )}`}
                >
                  置信度: {getConfidenceLabel(previewTask.confidence)} (
                  {(previewTask.confidence * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">开始日期：</span>
                  <span className="text-gray-900">{previewTask.startDate}</span>
                </div>
                <div>
                  <span className="text-gray-600">结束日期：</span>
                  <span className="text-gray-900">{previewTask.endDate || '未设置'}</span>
                </div>
                <div>
                  <span className="text-gray-600">负责人：</span>
                  <span className="text-gray-900">{previewTask.assignee || '未指定'}</span>
                </div>
                <div>
                  <span className="text-gray-600">阶段：</span>
                  <span className="text-gray-900">{previewTask.phase || '未分组'}</span>
                </div>
                {previewTask.description && (
                  <div className="col-span-2">
                    <span className="text-gray-600">说明：</span>
                    <span className="text-gray-900">{previewTask.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">识别任务数</p>
              <p className="text-2xl font-bold text-blue-900">{parseResult.tasks.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">高置信度</p>
              <p className="text-2xl font-bold text-green-900">
                {parseResult.tasks.filter(t => t.confidence >= 0.9).length}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">需确认</p>
              <p className="text-2xl font-bold text-yellow-900">{lowConfidenceTasks.length}</p>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(fieldMapping)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            确认并生成甘特图
          </button>
        </div>
      </div>
    </div>
  )
}
