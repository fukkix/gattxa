import { useProjectStore } from '../store/projectStore'

export default function GanttControls() {
  const { ganttConfig, updateGanttConfig } = useProjectStore()

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center gap-6">
      {/* 时间粒度切换 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">时间粒度:</span>
        <div className="flex rounded-md shadow-sm">
          {(['day', 'week', 'month'] as const).map(scale => (
            <button
              key={scale}
              onClick={() => updateGanttConfig({ timeScale: scale })}
              className={`px-3 py-1 text-sm border ${
                ganttConfig.timeScale === scale
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } ${
                scale === 'day'
                  ? 'rounded-l-md'
                  : scale === 'month'
                  ? 'rounded-r-md'
                  : 'border-l-0'
              }`}
            >
              {scale === 'day' ? '日' : scale === 'week' ? '周' : '月'}
            </button>
          ))}
        </div>
      </div>

      {/* 缩放控制 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">缩放:</span>
        <button
          onClick={() =>
            updateGanttConfig({ zoom: Math.max(50, ganttConfig.zoom - 10) })
          }
          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          title="缩小"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>
        <span className="text-sm text-gray-700 w-12 text-center">
          {ganttConfig.zoom}%
        </span>
        <button
          onClick={() =>
            updateGanttConfig({ zoom: Math.min(300, ganttConfig.zoom + 10) })
          }
          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          title="放大"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>
      </div>

      {/* 今日按钮 */}
      <button
        onClick={() => {
          // TODO: 实现跳转到今天的逻辑
          console.log('跳转到今天')
        }}
        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded border border-indigo-200"
      >
        📍 今天
      </button>

      {/* 周末显示切换 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={ganttConfig.showWeekends}
          onChange={e => updateGanttConfig({ showWeekends: e.target.checked })}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700">显示周末</span>
      </label>
    </div>
  )
}
