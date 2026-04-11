import { useState, useEffect } from 'react'
import { Task } from '../types'
import axios from 'axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  mentions: string[]
  created_at: string
  updated_at: string
  user_name: string
  user_email: string
}

interface CommentSectionProps {
  task: Task
  onClose: () => void
}

export default function CommentSection({ task, onClose }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    loadComments()
  }, [task.id])

  const loadComments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tasks/${task.id}/comments`
      )
      setComments(response.data)
    } catch (error) {
      console.error('加载评论失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 提取 @ 提及
      const mentions = extractMentions(newComment)
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/${task.id}/comments`,
        { content: newComment, mentions },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setNewComment('')
      await loadComments()
    } catch (error) {
      console.error('发送评论失败:', error)
      alert('发送评论失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setEditingId(null)
      setEditContent('')
      await loadComments()
    } catch (error) {
      console.error('更新评论失败:', error)
      alert('更新评论失败')
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      await loadComments()
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除评论失败')
    }
  }

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const matches = text.match(mentionRegex)
    return matches ? matches.map(m => m.substring(1)) : []
  }

  const highlightMentions = (text: string): string => {
    return text.replace(/@(\w+)/g, '<span class="text-indigo-600 font-medium">@$1</span>')
  }

  const currentUserId = localStorage.getItem('userId')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">任务评论</h2>
            <p className="text-sm text-gray-600 mt-1">{task.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 评论列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>还没有评论，来发表第一条评论吧</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                      {comment.user_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{comment.user_name}</div>
                      <div className="text-xs text-gray-500">
                        {dayjs(comment.created_at).fromNow()}
                      </div>
                    </div>
                  </div>
                  
                  {comment.user_id === currentUserId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(comment.id)
                          setEditContent(comment.content)
                        }}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                
                {editingId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(comment.id)}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditContent('')
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlightMentions(comment.content) }}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* 输入框 */}
        <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="输入评论... (使用 @ 提及其他人)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-500">
              支持 @ 提及，例如：@张三
            </div>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '发送中...' : '发送评论'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
