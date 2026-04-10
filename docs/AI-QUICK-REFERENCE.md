# AI 功能快速参考

## 用户配置流程

```
1. 点击"上传文件"
   ↓
2. 点击"AI 设置"
   ↓
3. 选择提供商（OpenRouter 推荐）
   ↓
4. 输入 API Key
   ↓
5. 选择模型（Claude Sonnet 4 推荐）
   ↓
6. 保存设置
   ↓
7. 上传文件解析
```

## 开发者集成示例

### 1. 检查 AI 配置

```typescript
import { hasAISettings, getAISettings } from './components/AISettingsDialog'

// 检查是否已配置
if (!hasAISettings()) {
  alert('请先配置 AI 设置')
  return
}

// 获取配置
const aiSettings = getAISettings()
// { provider: 'openrouter', apiKey: 'sk-...', model: 'anthropic/claude-sonnet-4' }
```

### 2. 调用文件解析 API

```typescript
import { uploadFile, parseFile } from './api/upload'
import { getAISettings } from './components/AISettingsDialog'

// 1. 上传文件
const uploadResult = await uploadFile(file)

// 2. 读取文件内容
const fileContent = await readFileContent(file)

// 3. 获取 AI 设置
const aiSettings = getAISettings()

// 4. 调用解析
const parseResult = await parseFile(
  uploadResult.id,
  fileContent,
  aiSettings
)
```

### 3. 使用完整组件

```typescript
import FileUploadWithParsing from './components/FileUploadWithParsing'

function MyComponent() {
  const [showUpload, setShowUpload] = useState(false)

  const handleComplete = (result) => {
    console.log('解析完成:', result)
    // 处理解析结果
  }

  return (
    <>
      <button onClick={() => setShowUpload(true)}>
        上传文件
      </button>

      {showUpload && (
        <FileUploadWithParsing
          onClose={() => setShowUpload(false)}
          onComplete={handleComplete}
        />
      )}
    </>
  )
}
```

## API 接口

### 前端 API

#### `getAISettings(): AISettings | null`

获取保存的 AI 设置。

```typescript
const settings = getAISettings()
if (settings) {
  console.log(settings.provider) // 'openrouter' | 'anthropic'
  console.log(settings.apiKey)   // 'sk-...'
  console.log(settings.model)    // 'anthropic/claude-sonnet-4'
}
```

#### `hasAISettings(): boolean`

检查是否已配置 AI。

```typescript
if (hasAISettings()) {
  // 可以使用 AI 功能
} else {
  // 需要配置
}
```

#### `parseFile(fileId, fileContent, aiSettings): Promise<ParseResponse>`

调用 AI 解析文件。

```typescript
const result = await parseFile(fileId, fileContent, {
  provider: 'openrouter',
  apiKey: 'sk-or-v1-...',
  model: 'anthropic/claude-sonnet-4'
})

console.log(result.tasks)        // 解析的任务列表
console.log(result.accuracy)     // 准确率
console.log(result.fieldMapping) // 字段映射
```

### 后端 API

#### `POST /api/parse`

触发文件解析。

**请求体：**
```json
{
  "fileId": "uuid",
  "fileContent": "...",
  "provider": "openrouter",
  "apiKey": "sk-or-v1-...",
  "model": "anthropic/claude-sonnet-4"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "result": {
      "tasks": [...],
      "fieldMapping": {...},
      "warnings": [...]
    },
    "accuracy": 0.95
  }
}
```

## 数据结构

### AISettings

```typescript
interface AISettings {
  provider: 'anthropic' | 'openrouter'
  apiKey: string
  model: string
}
```

### ParseResult

```typescript
interface ParseResult {
  tasks: ParsedTask[]
  fieldMapping: Record<string, string>
  warnings?: string[]
}

interface ParsedTask {
  name: string
  startDate: string        // YYYY-MM-DD
  endDate: string | null   // YYYY-MM-DD
  assignee: string
  phase: string
  description?: string
  confidence: number       // 0-1
}
```

## 支持的模型

### OpenRouter（推荐）

| 模型 | 速度 | 成本 | 准确率 | 推荐场景 |
|------|------|------|--------|----------|
| anthropic/claude-sonnet-4 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 通用推荐 |
| anthropic/claude-3.5-sonnet | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 平衡选择 |
| anthropic/claude-3-haiku | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 预算有限 |

### Anthropic 官方

| 模型 | 速度 | 成本 | 准确率 |
|------|------|------|--------|
| claude-sonnet-4-20250514 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| claude-3-5-sonnet-20241022 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

## 费用估算

### 典型项目文件（50 个任务）

| 模型 | 输入 | 输出 | 总成本 |
|------|------|------|--------|
| Claude Sonnet 4 | 2K tokens | 1.5K tokens | ~$0.03 |
| Claude 3.5 Sonnet | 2K tokens | 1.5K tokens | ~$0.02 |
| Claude 3 Haiku | 2K tokens | 1.5K tokens | ~$0.002 |

### 月度使用估算

假设每天解析 10 个文件：

- Claude Sonnet 4: $9/月
- Claude 3.5 Sonnet: $6/月
- Claude 3 Haiku: $0.6/月

## 常见问题

### Q: API Key 存储在哪里？

A: 浏览器 localStorage，键名为 `ai_settings`。

### Q: 如何清除配置？

A: 在 AI 设置对话框中点击"清除设置"，或手动删除 localStorage。

### Q: 支持哪些文件格式？

A: Excel (.xlsx, .xls)、Word (.docx)、CSV (.csv)。

### Q: 解析失败怎么办？

A: 检查：
1. API Key 是否正确
2. 账户余额是否充足
3. 文件格式是否正确
4. 网络连接是否正常

### Q: 如何提高解析准确率？

A: 
1. 使用清晰的列标题
2. 使用标准日期格式（YYYY-MM-DD）
3. 避免合并单元格
4. 选择更强大的模型（Claude Sonnet 4）

## 相关链接

- [完整配置指南](OPENROUTER-SETUP.md)
- [迁移指南](AI-MIGRATION-GUIDE.md)
- [API 文档](API.md)
- [OpenRouter 官网](https://openrouter.ai/)
- [Anthropic 官网](https://www.anthropic.com/)
