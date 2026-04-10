import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// 添加请求拦截器（自动添加 token）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface UploadResponse {
  id: string
  fileName: string
  fileSize: number
  status: string
  createdAt: string
}

export interface ParseResult {
  tasks: Array<{
    name: string
    startDate: string
    endDate: string | null
    assignee: string
    phase: string
    description?: string
    confidence: number
  }>
  fieldMapping: Record<string, string>
  warnings?: string[]
}

export interface ParseResponse {
  id: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  result?: ParseResult
  accuracy?: number
  errors?: string[]
  errorMessage?: string
}

// 上传文件
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}

// 触发文件解析
export const parseFile = async (fileId: string, fileContent: string): Promise<ParseResponse> => {
  const response = await api.post('/api/parse', {
    fileId,
    fileContent,
  })

  return response.data.data
}

// 查询解析状态
export const getParseStatus = async (parseId: string): Promise<ParseResponse> => {
  const response = await api.get(`/api/parse/${parseId}/status`)
  return response.data.data
}

// 更新字段映射
export const updateFieldMapping = async (
  parseId: string,
  fieldMapping: Record<string, string>
): Promise<ParseResult> => {
  const response = await api.put(`/api/parse/${parseId}/mapping`, {
    fieldMapping,
  })

  return response.data.data
}

// 获取上传历史
export const getUploadHistory = async (): Promise<UploadResponse[]> => {
  const response = await api.get('/api/upload/history')
  return response.data.data
}

// 删除解析记录
export const deleteParseRecord = async (parseId: string): Promise<void> => {
  await api.delete(`/api/parse/${parseId}`)
}
