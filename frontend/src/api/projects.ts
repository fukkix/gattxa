import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Project {
  id: string
  userId: string
  name: string
  description: string
  tasks?: any[]
  createdAt: string
  updatedAt: string
}

export interface CreateProjectData {
  name: string
  description?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
}

// 获取用户的所有项目
export async function getProjects(): Promise<Project[]> {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${API_URL}/api/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.data
}

// 创建项目
export async function createProject(data: CreateProjectData): Promise<Project> {
  const token = localStorage.getItem('token')
  const response = await axios.post(`${API_URL}/api/projects`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.data
}

// 获取单个项目（包含任务）
export async function getProject(id: string): Promise<Project> {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${API_URL}/api/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.data
}

// 更新项目
export async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  const token = localStorage.getItem('token')
  const response = await axios.put(`${API_URL}/api/projects/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.data
}

// 删除项目
export async function deleteProject(id: string): Promise<void> {
  const token = localStorage.getItem('token')
  await axios.delete(`${API_URL}/api/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// 保存项目任务
export async function saveProjectTasks(projectId: string, tasks: any[]): Promise<any[]> {
  const token = localStorage.getItem('token')
  const response = await axios.post(
    `${API_URL}/api/projects/${projectId}/tasks`,
    { tasks },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data.data
}

// 获取项目任务
export async function getProjectTasks(projectId: string): Promise<any[]> {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${API_URL}/api/projects/${projectId}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.data
}

// 获取项目成员列表
export interface ProjectMember {
  id: string
  name: string
  email: string | null
  role: 'owner' | 'member'
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const token = localStorage.getItem('token')
  const response = await axios.get(`${API_URL}/api/projects/${projectId}/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data.data
}
