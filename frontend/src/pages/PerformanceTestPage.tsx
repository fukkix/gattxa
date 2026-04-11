import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { generateTestTasks, measurePerformance } from '../utils/testDataGenerator'
import LoadingSpinner from '../components/LoadingSpinner'

export default function PerformanceTestPage() {
  const navigate = useNavigate()
  const { createProject, addTask } = useProjectStore()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ count: number; duration: number }[]>([])

  const runTest = async (taskCount: number) => {
    setLoading(true)
    try {
      // 创建测试项目
      const project = await createProject(`性能测试 - ${taskCount} 任务`)
      
      // 生成测试任务
      const testTasks = generateTestTasks(taskCount)
      
      // 测量添加任务的性能
      const addDuration = await measurePerformance(
        `添加 ${taskCount} 个任务`,
        async () => {
          for (const task of testTasks) {
            await addTask(task)
          }
        }
      )
      
      setResults(prev => [...prev, { count: taskCount, duration: addDuration }])
      
      // 跳转到编辑器页面查看结果
      setTimeout(() => {
        navigate(`/editor/${project.id}`)
      }, 1000)
    } catch (error) {
      console.error('性能测试失败:', error)
      alert('性能测试失败，请查看控制台')
    } finally {
      setLoading(false)
    }
  }

  const measurePerformance = async (
    label: string,
    fn: () => Promise<void>
  ): Promise<number> => {
    const start = performance.now()
    await fn()
    const end = performance.now()
    const duration = end - start
    console.log(`[性能测试] ${label}: ${duration.toFixed(2)}ms`)
    return duration
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              性能测试工具
            </h1>
            <p className="text-gray-600">
              测试不同任务数量下的渲染性能
            </p>
          </div>

          {loading && (
            <div className="mb-8">
              <LoadingSpinner />
              <p className="text-center text-gray-600 mt-4">
                正在生成测试数据...
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => runTest(50)}
              disabled={loading}
              className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl font-bold">50</div>
              <div className="text-sm">任务</div>
            </button>
            <button
              onClick={() => runTest(100)}
              disabled={loading}
              className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl font-bold">100</div>
              <div className="text-sm">任务</div>
            </button>
            <button
              onClick={() => runTest(500)}
              disabled={loading}
              className="px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl font-bold">500</div>
              <div className="text-sm">任务</div>
            </button>
            <button
              onClick={() => runTest(1000)}
              disabled={loading}
              className="px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="text-2xl font-bold">1000</div>
              <div className="text-sm">任务</div>
            </button>
          </div>

          {results.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                测试结果
              </h2>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-indigo-600">
                        {result.count}
                      </div>
                      <div className="text-gray-600">个任务</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {result.duration.toFixed(2)} ms
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.duration < 500 ? '✅ 优秀' : 
                         result.duration < 2000 ? '⚠️ 良好' : '❌ 需优化'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              性能目标
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 100 任务渲染 ≤ 500ms</li>
              <li>• 500 任务渲染 ≤ 2s</li>
              <li>• 1000 任务渲染 ≤ 5s</li>
              <li>• 滚动帧率 ≥ 60 FPS</li>
            </ul>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
