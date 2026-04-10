import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            GanttFlow
          </h1>
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
            <button className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition">
              上传文件
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">双轨输入</h3>
            <p className="text-gray-600">
              手动填写或上传 Excel/Word，AI 自动解析
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">可视化编辑</h3>
            <p className="text-gray-600">
              所见即所得的甘特图编辑器
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">一键分享</h3>
            <p className="text-gray-600">
              生成专属链接，无需注册即可查看
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
