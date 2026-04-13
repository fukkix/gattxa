import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
}

interface MentionAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (user: User) => void
  projectId?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  className?: string
}

export default function MentionAutocomplete({
  value,
  onChange,
  onSelect,
  projectId,
  placeholder = '输入评论... (使用 @ 提及其他人)',
  rows = 3,
  disabled = false,
  className = ''
}: MentionAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 检测 @ 输入
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = value
    const pos = cursorPosition

    // 查找最近的 @ 符号
    let atIndex = -1
    for (let i = pos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atIndex = i
        break
      }
      if (text[i] === ' ' || text[i] === '\n') {
        break
      }
    }

    if (atIndex !== -1) {
      const query = text.substring(atIndex + 1, pos)
      // 检查是否是有效的查询（不包含空格或换行）
      if (!/[\s\n]/.test(query)) {
        setMentionQuery(query)
        loadSuggestions(query)
        return
      }
    }

    setShowSuggestions(false)
    setMentionQuery('')
  }, [value, cursorPosition])

  const loadSuggestions = async (query: string) => {
    try {
      const token = localStorage.getItem('token')
      const url = projectId
        ? `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/members?search=${query}`
        : `${import.meta.env.VITE_API_URL}/api/users/search?q=${query}`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuggestions(response.data)
      setShowSuggestions(response.data.length > 0)
      setSelectedIndex(0)
    } catch (error) {
      console.error('加载用户建议失败:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const insertMention = (user: User) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = value
    const pos = cursorPosition

    // 找到 @ 符号的位置
    let atIndex = -1
    for (let i = pos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atIndex = i
        break
      }
    }

    if (atIndex !== -1) {
      const before = text.substring(0, atIndex)
      const after = text.substring(pos)
      const newText = `${before}@${user.name} ${after}`
      
      onChange(newText)
      
      // 设置光标位置
      setTimeout(() => {
        const newPos = atIndex + user.name.length + 2
        textarea.setSelectionRange(newPos, newPos)
        textarea.focus()
        setCursorPosition(newPos)
      }, 0)

      if (onSelect) {
        onSelect(user)
      }
    }

    setShowSuggestions(false)
    setMentionQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        if (suggestions.length > 0) {
          e.preventDefault()
          insertMention(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    setCursorPosition(e.target.selectionStart)
  }

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    setCursorPosition(target.selectionStart)
  }

  // 滚动选中项到可见区域
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, showSuggestions])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${className}`}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                index === selectedIndex ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-sm text-gray-500 truncate">{user.email}</div>
              </div>
              {index === selectedIndex && (
                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div className="absolute bottom-full left-0 right-0 mb-1 text-xs text-gray-500 px-2">
          使用 ↑↓ 选择，Enter 确认，Esc 取消
        </div>
      )}
    </div>
  )
}
