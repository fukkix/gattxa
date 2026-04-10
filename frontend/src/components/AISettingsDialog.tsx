import { useState, useEffect } from 'react'

interface AISettingsDialogProps {
  onClose: () => void
  onSave: (settings: AISettings) => void
}

export interface AISettings {
  provider: 'anthropic' | 'openrouter'
  apiKey: string
  model: string
}

const MODELS = {
  anthropic: [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (推荐)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
  openrouter: [
    { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4 (推荐)' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (快速)' },
  ],
}

export default function AISettingsDialog({ onClose, onSave }: AISettingsDialogProps) {
  const [provider, setProvider] = useState<'anthropic' | 'openrouter'>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    // 从 localStorage 加载设置
    const saved = localStorage.getItem('ai_settings')
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setProvider(settings.provider || 'openrouter')
        setApiKey(settings.apiKey || '')
        setModel(settings.model || '')
      } catch (error) {
        console.error('加载 AI 设置失败:', error)
      }
    }
    
    // 设置默认模型
    if (!model) {
      setModel(MODELS.openrouter[0].value)
    }
  }, [])

  useEffect(() => {
    // 切换提供商时更新默认模型
    const defaultModel = MODELS[provider][0].value
    setModel(defaultModel)
  }, [provider])

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('请输入 API Key')
      return
    }

    const settings: AISettings = {
      provider,
      apiKey: apiKey.trim(),
      model,
    }

    // 保存到 localStorage
    localStorage.setItem('ai_settings', JSON.stringify(settings))
    
    onSave(settings)
    onClose()
  }

  const handleClear = () => {
    if (confirm('确定要清除 AI 设置吗？')) {
      localStorage.removeItem('ai_settings')
      setApiKey('')
      setModel(MODELS[provider][0].value)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-3xl shadow-ambient-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between">
          <h2 className="text-headline-sm font-headline text-on-surface">AI 设置</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-primary-fixed-dim/20 border border-primary/20 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">info</span>
                <div className="flex-1">
                  <p className="text-sm text-on-surface mb-2">
                    <strong>为什么需要 API Key？</strong>
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    AI 文件解析功能需要调用 Claude API。您的 API Key 仅存储在本地浏览器中，不会上传到服务器。
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">
                API 提供商
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProvider('openrouter')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    provider === 'openrouter'
                      ? 'border-primary bg-primary-fixed-dim/20'
                      : 'border-surface-container hover:border-primary/30'
                  }`}
                >
                  <div className="font-bold text-on-surface mb-1">OpenRouter</div>
                  <div className="text-xs text-on-surface-variant">
                    推荐 · 更便宜 · 多模型
                  </div>
                </button>
                <button
                  onClick={() => setProvider('anthropic')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    provider === 'anthropic'
                      ? 'border-primary bg-primary-fixed-dim/20'
                      : 'border-surface-container hover:border-primary/30'
                  }`}
                >
                  <div className="font-bold text-on-surface mb-1">Anthropic</div>
                  <div className="text-xs text-on-surface-variant">
                    官方 API · 直连
                  </div>
                </button>
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={
                    provider === 'openrouter'
                      ? 'sk-or-v1-...'
                      : 'sk-ant-api03-...'
                  }
                  className="w-full px-4 py-3 pr-12 bg-surface-container-highest text-on-surface rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showKey ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">
                {provider === 'openrouter' ? (
                  <>
                    获取 API Key：
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      https://openrouter.ai/keys
                    </a>
                  </>
                ) : (
                  <>
                    获取 API Key：
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      https://console.anthropic.com/
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">
                模型选择
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl 
                         focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              >
                {MODELS[provider].map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-on-surface-variant">
                推荐使用 Claude Sonnet 4，性能和成本平衡最佳
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-surface-container-low rounded-xl p-4">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface mb-1">隐私保护</p>
                  <p className="text-xs text-on-surface-variant">
                    您的 API Key 仅存储在浏览器本地存储中，不会发送到我们的服务器。
                    文件解析时，您的 API Key 会直接从浏览器发送到 AI 服务商。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-container bg-surface-container-low flex justify-between">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-error hover:bg-error-container rounded-xl transition-all"
          >
            清除设置
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-on-surface hover:bg-surface-container rounded-xl transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-all"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 辅助函数：获取保存的 AI 设置
export function getAISettings(): AISettings | null {
  const saved = localStorage.getItem('ai_settings')
  if (!saved) return null
  
  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}

// 辅助函数：检查是否已配置 AI
export function hasAISettings(): boolean {
  return !!getAISettings()?.apiKey
}
