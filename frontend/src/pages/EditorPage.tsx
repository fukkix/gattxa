import { useParams } from 'react-router-dom'

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">项目编辑器</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            保存
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            分享
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-80 bg-gray-50 border-r p-4">
          <h2 className="font-semibold mb-4">任务列表</h2>
          <p className="text-gray-500 text-sm">项目 ID: {id}</p>
          {/* 任务表单将在这里 */}
        </aside>

        <main className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow h-full flex items-center justify-center">
            <p className="text-gray-400">甘特图渲染区域</p>
          </div>
        </main>
      </div>
    </div>
  )
}
