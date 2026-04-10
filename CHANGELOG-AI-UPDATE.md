# AI 功能更新日志

## 版本：v0.2.0 - AI 配置客户端化

**发布日期**：2026-04-11

### 🎯 主要变更

AI 文件解析功能从服务器端配置迁移到客户端配置，用户现在需要自行提供 API Key。

### ✨ 新增功能

#### 前端

1. **AISettingsDialog 组件** (`frontend/src/components/AISettingsDialog.tsx`)
   - 支持选择 API 提供商（Anthropic 官方 / OpenRouter）
   - API Key 输入和显示/隐藏切换
   - 模型选择（根据提供商动态显示）
   - 本地存储配置
   - 清除设置功能
   - 隐私保护说明

2. **FileUploadWithParsing 组件** (`frontend/src/components/FileUploadWithParsing.tsx`)
   - 完整的文件上传和解析流程
   - 支持 Excel、Word、CSV 文件读取
   - 集成 AI 设置检查
   - 解析进度显示
   - 错误处理和重试

3. **更新的 FileUpload 组件**
   - 上传前检查 AI 配置
   - 集成 AISettingsDialog
   - 配置提示和引导

#### 后端

1. **aiParser 服务更新** (`backend/src/services/aiParser.ts`)
   - 新增 `ParseOptions` 接口
   - 支持 Anthropic 和 OpenRouter 两种提供商
   - `parseFileWithAI` 函数接受 options 参数
   - 新增 `validateParseResult` 和 `calculateAccuracy` 函数

2. **parse 路由更新** (`backend/src/routes/parse.ts`)
   - 接受前端传来的 AI 配置（provider, apiKey, model）
   - 验证 AI 配置参数
   - 传递配置到 AI 解析服务

3. **upload API 更新** (`frontend/src/api/upload.ts`)
   - 新增 `AISettings` 接口
   - `parseFile` 函数接受 aiSettings 参数

### 📚 新增文档

1. **AI 配置指南** (`docs/OPENROUTER-SETUP.md`)
   - 详细的 API Key 获取步骤
   - 配置说明
   - 数据隐私说明
   - 费用估算
   - 常见问题解答

2. **AI 迁移指南** (`docs/AI-MIGRATION-GUIDE.md`)
   - 变更概述和原因
   - 技术实现细节
   - 数据流说明
   - 安全考虑
   - 迁移步骤
   - 故障排查

### 🔧 配置变更

1. **backend/.env.example**
   - 移除 `CLAUDE_API_KEY`
   - 移除 `OPENROUTER_API_KEY`
   - 移除 `API_PROVIDER`
   - 保留 `APP_URL`（用于 OpenRouter HTTP-Referer）

2. **README.md**
   - 添加 AI 配置说明
   - 链接到详细配置指南

### 🔒 安全改进

- API Key 仅存储在用户浏览器本地
- 不再在服务器端存储 API Key
- 用户完全控制自己的 API Key
- 支持随时清除本地配置

### 📊 支持的 AI 模型

#### Anthropic 官方
- claude-sonnet-4-20250514 (推荐)
- claude-3-5-sonnet-20241022
- claude-3-opus-20240229

#### OpenRouter
- anthropic/claude-sonnet-4 (推荐)
- anthropic/claude-3.5-sonnet
- anthropic/claude-3-opus
- anthropic/claude-3-haiku (快速，便宜)

### 💰 费用说明

用户现在需要自己承担 AI API 调用费用：

- **Claude Sonnet 4**：约 $0.03/次（50 个任务）
- **Claude 3 Haiku**：约 $0.002/次（50 个任务）

### 🚀 升级指南

#### 对于开发者

```bash
# 1. 更新代码
git pull

# 2. 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 3. 更新环境变量
# 删除 .env 中的 CLAUDE_API_KEY 和 OPENROUTER_API_KEY

# 4. 重启服务
docker compose restart
```

#### 对于用户

1. 获取 API Key：
   - OpenRouter: https://openrouter.ai/keys
   - Anthropic: https://console.anthropic.com/settings/keys

2. 在应用中配置：
   - 点击"上传文件" → "AI 设置"
   - 输入 API Key 和选择模型
   - 保存设置

### 🐛 已知问题

无

### 📝 待办事项

- [ ] 添加 AI 使用统计（调用次数、费用估算）
- [ ] 支持更多 AI 提供商（OpenAI、Google Gemini）
- [ ] 添加 API Key 有效性验证
- [ ] 优化 AI Prompt 以提高解析准确率

### 🙏 致谢

感谢所有参与测试和反馈的用户！

---

**完整变更列表**：https://github.com/fukkix/gattxa/compare/v0.1.0...v0.2.0
