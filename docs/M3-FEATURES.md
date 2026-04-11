# M3 阶段功能文档

**版本**: 1.1.0  
**更新日期**: 2026-04-11  
**状态**: 开发中

---

## 功能概述

M3 阶段主要增加了协作和导出功能，包括：
- 评论系统
- @ 提及功能
- PDF 导出
- 性能测试工具

---

## 1. 评论系统

### 功能描述

允许用户对任务添加评论，支持编辑、删除和查看评论历史。

### 使用方法

1. 在任务列表中，悬停在任务上
2. 点击"评论"按钮（💬 图标）
3. 在弹出的对话框中输入评论
4. 点击"发送评论"

### 技术实现

**后端 API**:
- `POST /api/tasks/:taskId/comments` - 创建评论
- `GET /api/tasks/:taskId/comments` - 获取任务评论
- `GET /api/projects/:projectId/comments` - 获取项目所有评论
- `PUT /api/comments/:id` - 更新评论
- `DELETE /api/comments/:id` - 删除评论

**前端组件**:
- `CommentSection.tsx` - 评论对话框组件
- 集成在 `TaskList.tsx` 中

**数据库表**:
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 功能特性

- ✅ 创建评论
- ✅ 编辑自己的评论
- ✅ 删除自己的评论
- ✅ 查看评论历史
- ✅ 显示评论时间（相对时间）
- ✅ 显示评论者信息
- ✅ 空状态提示

---

## 2. @ 提及功能

### 功能描述

在评论中使用 @ 符号提及其他用户，被提及的用户可以收到通知。

### 使用方法

1. 在评论输入框中输入 `@用户名`
2. 系统会自动识别并高亮显示
3. 发送评论后，被提及的用户会收到通知

### 技术实现

**提及识别**:
```typescript
const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g
  const matches = text.match(mentionRegex)
  return matches ? matches.map(m => m.substring(1)) : []
}
```

**高亮显示**:
```typescript
const highlightMentions = (text: string): string => {
  return text.replace(/@(\w+)/g, '<span class="text-indigo-600 font-medium">@$1</span>')
}
```

**后端 API**:
- `GET /api/mentions` - 获取用户被提及的评论

### 功能特性

- ✅ @ 提及识别
- ✅ 提及高亮显示
- ✅ 提及通知（API 已实现）
- ⏳ 提及自动补全（待实现）
- ⏳ 提及通知 UI（待实现）

---

## 3. PDF 导出

### 功能描述

将项目导出为完整的 PDF 文档，包含甘特图和任务列表。

### 使用方法

1. 在编辑器页面点击"导出"按钮
2. 选择"PDF 文档"选项
3. 点击"导出"按钮
4. PDF 文件自动下载

### 技术实现

**依赖库**:
- `jspdf` - PDF 生成库

**导出内容**:
1. 封面页
   - 项目名称
   - 导出日期
2. 甘特图页
   - 高清甘特图图片
   - 自动分页（如果图片太长）
3. 任务列表页
   - 表格形式的任务列表
   - 包含所有任务字段
   - 自动分页
4. 页脚
   - 页码（第 X 页，共 Y 页）

**代码示例**:
```typescript
export async function exportToPDF(
  projectName: string,
  tasks: Task[],
  canvasElement: HTMLCanvasElement,
  filename: string = 'gantt-chart.pdf'
) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })
  
  // 添加标题、甘特图、任务列表
  // ...
  
  pdf.save(filename)
}
```

### 功能特性

- ✅ PDF 生成
- ✅ 甘特图导出
- ✅ 任务列表导出
- ✅ 自动分页
- ✅ 页码显示
- ✅ 高清图片（2x 分辨率）
- ⏳ 自定义样式（待实现）
- ⏳ 水印支持（待实现）

---

## 4. 性能测试工具

### 功能描述

提供性能测试工具，用于测试不同任务数量下的渲染性能。

### 使用方法

1. 访问 `/performance-test` 路径
2. 选择要测试的任务数量（50/100/500/1000）
3. 点击按钮开始测试
4. 查看测试结果和性能指标

### 技术实现

**测试数据生成**:
```typescript
export function generateTestTasks(count: number): Omit<Task, 'id'>[] {
  // 生成指定数量的测试任务
  // 包含随机的阶段、负责人、日期等
}
```

**性能测量**:
```typescript
export function measurePerformance(label: string, fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  return end - start
}
```

**测试页面**:
- `PerformanceTestPage.tsx` - 性能测试页面
- `testDataGenerator.ts` - 测试数据生成器

### 性能目标

| 任务数量 | 目标时间 | 状态 |
|---------|---------|------|
| 50 任务 | ≤ 200ms | ✅ |
| 100 任务 | ≤ 500ms | ✅ |
| 500 任务 | ≤ 2s | ✅ |
| 1000 任务 | ≤ 5s | ✅ |

### 功能特性

- ✅ 测试数据生成
- ✅ 性能测量
- ✅ 结果展示
- ✅ 多种任务数量测试
- ⏳ 性能分析报告（待实现）
- ⏳ 性能对比（待实现）

---

## API 文档

### 评论相关 API

#### 创建评论
```http
POST /api/tasks/:taskId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "这是一条评论",
  "mentions": ["user_id_1", "user_id_2"]
}
```

**响应**:
```json
{
  "id": "comment_id",
  "task_id": "task_id",
  "user_id": "user_id",
  "content": "这是一条评论",
  "mentions": ["user_id_1", "user_id_2"],
  "created_at": "2026-04-11T12:00:00Z",
  "updated_at": "2026-04-11T12:00:00Z"
}
```

#### 获取任务评论
```http
GET /api/tasks/:taskId/comments
```

**响应**:
```json
[
  {
    "id": "comment_id",
    "task_id": "task_id",
    "user_id": "user_id",
    "content": "这是一条评论",
    "mentions": [],
    "created_at": "2026-04-11T12:00:00Z",
    "updated_at": "2026-04-11T12:00:00Z",
    "user_name": "张三",
    "user_email": "zhangsan@example.com"
  }
]
```

#### 更新评论
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "更新后的评论内容"
}
```

#### 删除评论
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

#### 获取提及
```http
GET /api/mentions
Authorization: Bearer <token>
```

---

## 使用示例

### 评论功能示例

```typescript
// 创建评论
const createComment = async (taskId: string, content: string) => {
  const token = localStorage.getItem('token')
  const mentions = extractMentions(content)
  
  const response = await axios.post(
    `/api/tasks/${taskId}/comments`,
    { content, mentions },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  
  return response.data
}

// 获取评论
const getComments = async (taskId: string) => {
  const response = await axios.get(`/api/tasks/${taskId}/comments`)
  return response.data
}
```

### PDF 导出示例

```typescript
import { exportToPDF } from '../utils/exportUtils'

const handleExportPDF = async () => {
  const canvasElement = canvasRef.current
  if (!canvasElement) return
  
  await exportToPDF(
    projectName,
    tasks,
    canvasElement,
    `${projectName}_${timestamp}.pdf`
  )
}
```

### 性能测试示例

```typescript
import { generateTestTasks, measurePerformance } from '../utils/testDataGenerator'

const runPerformanceTest = async (taskCount: number) => {
  const testTasks = generateTestTasks(taskCount)
  
  const duration = await measurePerformance(
    `渲染 ${taskCount} 个任务`,
    async () => {
      for (const task of testTasks) {
        await addTask(task)
      }
    }
  )
  
  console.log(`性能测试结果: ${duration.toFixed(2)}ms`)
}
```

---

## 已知问题

### 高优先级
- 无

### 中优先级
1. 提及自动补全功能未实现
2. 提及通知 UI 未实现
3. PDF 导出样式可以进一步优化

### 低优先级
1. 性能测试报告功能未实现
2. PDF 水印支持未实现

---

## 下一步计划

### M3 阶段剩余工作
1. ⏳ 提及自动补全
2. ⏳ 提及通知 UI
3. ⏳ 权限管理优化
4. ⏳ 评论通知系统

### M4 阶段（实时协作）
1. ⏳ WebSocket 实时同步
2. ⏳ 多人在线显示
3. ⏳ 冲突解决
4. ⏳ 操作历史

---

## 更新日志

### 2026-04-11
- ✅ 实现评论系统
- ✅ 实现 @ 提及功能
- ✅ 实现 PDF 导出
- ✅ 实现性能测试工具
- ✅ 更新 API 文档

---

**文档维护**: GanttXa Development Team  
**最后更新**: 2026-04-11
