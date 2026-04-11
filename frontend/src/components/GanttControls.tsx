import { useProjectStore } from '../store/projectStore'

export default function GanttControls() {
  const { ganttConfig, updateGanttConfig } = useProjectStore()

  const handleZoomIn = () => {
    updateGanttConfig({ zoom: Math.min(300, ganttConfig.zoom + 10) })
  }

  const handleZoomOut = () => {
    updateGanttConfig({ zoom: Math.max(50, ganttConfig.zoom - 10) })
  }

  const handleResetZoom = () => {
    updateGanttConfig({ zoom: 100 })
  }

  const handleTodayClick = () => {
    // TODO: 实现跳转到今天的逻辑
    const today = new Date()
    console.log('跳转到今天:', today)
    // 这里需要触发甘特图滚动到今天的位置
  }

  return (
    <div className="bg-surface-container-low border-b border-surface-container px-4 py-3 flex items-center gap-6 flex-wrap">
      {/* 时间粒度切换 */}
      <div className="flex items-center gap-2">
        <span className="text-label-md text-on-surface-variant">时间粒度:</span>
        <div className="flex rounded-xl overflow-hidden border border-surface-container">
          {(['day', 'week', 'month'] as const).map(scale => (
            <button
              key={scale}
              onClick={() => updateGanttConfig({ timeScale: scale })}
              className={`px-4 py-2 text-label-md transition-all ${
                ganttConfig.timeScale === scale
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-highest text-on-surface hover:bg-surface-container'
              } ${scale !== 'day' ? 'border-l border-surface-container' : ''}`}
            >
              {scale === 'day' ? '日' : scale === 'week' ? '周' : '月'}
            </button>
          ))}
        </div>
      </div>

      {/* 缩放控制 */}
      <div className="flex items-center gap-2">
        <span className="text-label-md text-on-surface-variant">缩放:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={ganttConfig.zoom <= 50}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="缩小"
          >
            <span className="material-symbols-outlined text-[20px]">zoom_out</span>
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-1 text-label-md text-on-surface hover:bg-surface-container rounded-lg transition-all min-w-[60px] text-center"
            title="重置缩放"
          >
            {ganttConfig.zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={ganttConfig.zoom >= 300}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="放大"
          >
            <span className="material-symbols-outlined text-[20px]">zoom_in</span>
          </button>
        </div>
      </div>

      {/* 今日按钮 */}
      <button
        onClick={handleTodayClick}
        className="px-4 py-2 text-label-md text-primary hover:bg-primary-container rounded-xl border border-primary/20 transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">today</span>
        今天
      </button>

      {/* 周末显示切换 */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={ganttConfig.showWeekends}
            onChange={e => updateGanttConfig({ showWeekends: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary transition-colors"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-on-primary"></div>
        </div>
        <span className="text-label-md text-on-surface group-hover:text-primary transition-colors">
          显示周末
        </span>
      </label>

      {/* 节假日显示切换 */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={ganttConfig.showHolidays}
            onChange={e => updateGanttConfig({ showHolidays: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary transition-colors"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-on-primary"></div>
        </div>
        <span className="text-label-md text-on-surface group-hover:text-primary transition-colors">
          显示节假日
        </span>
      </label>
    </div>
  )
}
