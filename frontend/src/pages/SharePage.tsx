import { useParams } from 'react-router-dom'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold">GanttFlow - 分享视图</h1>
      </header>

      <main className="flex-1 p-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-2">分享链接</p>
            <p className="text-sm text-gray-500">Token: {token}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
