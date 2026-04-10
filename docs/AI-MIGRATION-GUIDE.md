# AI 功能迁移指南

## 变更概述

GanttXa 的 AI 文件解析功能已从服务器端配置迁移到客户端配置，用户现在需要自行提供 API Key。

## 为什么要做这个改变？

### 优势

1. **数据隐私**：API Key 仅存储在用户浏览器本地，不经过我们的服务器
2. **成本控制**：用户自主控制 AI 使用成本和配额
3. **灵活性**：用户可以选择不同的 AI 提供商和模型
4. **透明度**：用户清楚知道 AI 调用的费用和使用情况

### 权衡

- 用户需要额外的配置步骤
- 需要用户自己注册 AI 服务商账号

## 技术实现

### 后端变更

#### 1. `backend/src/services/aiParser.ts`

```typescript
// 新增 ParseOptions 接口
export interface ParseOptions {
  provider: 'anthropic' | 'openrouter'
  apiKey: string
  model: string
}

// parseFileWithAI 函数现在接受 options 参数
export async function parseFileWithAI(
  content: string,
  fileName: string,
  options: ParseOptions
): Promise<ParseResult>
```

支持两种 AI 提供商：
- Anthropic 官方 API
- OpenRouter（推荐，价格更优惠）

#### 2. `backend/src/routes/parse.ts`

```typescript
// 解析 API 现在从请求体中获取 AI 配置
const { fileId, fileContent, provider, apiKey, model } = req.body

// 调用 AI 解析时传递配置
const parseResult = await parseFileWithAI(fileContent, record.file_name, {
  provider,
  apiKey,
  model,
})
```

### 前端变更

#### 1. `frontend/src/components/AISettingsDialog.tsx`

新增 AI 设置对话框组件：
- 选择 API 提供商（Anthropic / OpenRouter）
- 输入 API Key（支持显示/隐藏）
- 选择模型
- 本地存储配置
- 清除设置功能

导出的辅助函数：
```typescript
export function getAISettings(): AISettings | null
export function hasAISettings(): boolean
```

#### 2. `frontend/src/components/FileUpload.tsx`

更新文件上传组件：
- 上传前检查是否已配置 AI
- 集成 AISettingsDialog
- 显示配置提示和引导

#### 3. `frontend/src/api/upload.ts`

```typescript
// 新增 AISettings 接口
export interface AISettings {
  provider: 'anthropic' | 'openrouter'
  apiKey: string
  model: string
}

// parseFile 函数现在接受 aiSettings 参数
export const parseFile = async (
  fileId: string,
  fileContent: string,
  aiSettings: AISettings
): Promise<ParseResponse>
```

#### 4. `frontend/src/components/FileUploadWithParsing.tsx`（新增）

完整的文件上传和解析流程组件：
- 文件选择
- 文件内容读取（Excel/Word/CSV）
- 上传到服务器
- 调用 AI 解析（传递用户的 API Key）
- 显示解析进度
- 字段映射

## 数据流

```
用户浏览器
  ↓
1. 用户在 AISettingsDialog 中配置 API Key
  ↓
2. API Key 保存到 localStorage
  ↓
3. 用户上传文件
  ↓
4. 前端读取文件内容
  ↓
5. 前端从 localStorage 获取 AI 设置
  ↓
6. 前端调用后端 /api/parse，传递：
   - fileId
   - fileContent
   - provider
   - apiKey
   - model
  ↓
7. 后端使用用户提供的 API Key 调用 AI 服务
  ↓
8. 返回解析结果给前端
```

## 安全考虑

### API Key 存储

- 存储位置：浏览器 localStorage
- 存储格式：JSON 字符串
- 键名：`ai_settings`

### 传输安全

- API Key 通过 HTTPS 传输到后端
- 后端不存储 API Key
- 后端仅在当次请求中使用 API Key

### 最佳实践

1. 使用 HTTPS 部署应用
2. 定期更换 API Key
3. 不在公共电脑上保存 API Key
4. 使用完毕后清除设置

## 迁移步骤

### 对于开发者

1. 更新后端代码：
   ```bash
   cd backend
   git pull
   npm install
   ```

2. 更新前端代码：
   ```bash
   cd frontend
   git pull
   npm install
   ```

3. 移除环境变量中的 API Key：
   - 删除 `CLAUDE_API_KEY`
   - 删除 `OPENROUTER_API_KEY`
   - 删除 `API_PROVIDER`

4. 重启服务

### 对于用户

1. 获取 API Key：
   - OpenRouter: https://openrouter.ai/keys
   - Anthropic: https://console.anthropic.com/settings/keys

2. 在应用中配置：
   - 点击"上传文件"
   - 点击"AI 设置"
   - 输入 API Key 和选择模型
   - 保存设置

3. 开始使用 AI 文件解析功能

## 支持的模型

### Anthropic 官方

- `claude-sonnet-4-20250514` (推荐)
- `claude-3-5-sonnet-20241022`
- `claude-3-opus-20240229`

### OpenRouter

- `anthropic/claude-sonnet-4` (推荐)
- `anthropic/claude-3.5-sonnet`
- `anthropic/claude-3-opus`
- `anthropic/claude-3-haiku` (快速，便宜)

## 费用估算

一个典型的项目文件（50 个任务）：

### 使用 Claude Sonnet 4
- 输入：约 2,000 tokens
- 输出：约 1,500 tokens
- 成本：约 $0.03/次

### 使用 Claude 3 Haiku
- 输入：约 2,000 tokens
- 输出：约 1,500 tokens
- 成本：约 $0.002/次

## 故障排查

### 问题：解析失败，提示 "API Key 未提供"

解决：
1. 检查是否已在 AI 设置中配置 API Key
2. 检查浏览器 localStorage 中是否有 `ai_settings`
3. 尝试重新配置 AI 设置

### 问题：解析失败，提示 "API 调用失败"

解决：
1. 检查 API Key 是否正确
2. 检查账户余额是否充足
3. 检查网络连接
4. 查看浏览器控制台错误信息

### 问题：API Key 泄露怎么办？

解决：
1. 立即在 AI 服务商控制台撤销该 API Key
2. 生成新的 API Key
3. 在应用中更新配置

## 相关文档

- [AI 配置指南](OPENROUTER-SETUP.md)
- [API 文档](API.md)
- [开发指南](SETUP.md)

## 反馈

如有问题或建议，请提交 GitHub Issue：
https://github.com/fukkix/gattxa/issues
