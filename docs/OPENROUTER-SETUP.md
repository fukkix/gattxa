# AI 文件解析配置指南

GanttXa 的 AI 文件解析功能支持用户自行配置 API Key，确保数据隐私和安全。

## 支持的 AI 提供商

### 1. Anthropic 官方 API

直接使用 Claude 官方 API。

- 官网：https://www.anthropic.com/
- 获取 API Key：https://console.anthropic.com/settings/keys
- 支持模型：
  - `claude-3-5-sonnet-20241022` (推荐)
  - `claude-3-5-haiku-20241022`
  - `claude-3-opus-20240229`

### 2. OpenRouter (推荐)

通过 OpenRouter 访问多个 AI 模型，价格更优惠。

- 官网：https://openrouter.ai/
- 获取 API Key：https://openrouter.ai/keys
- 支持模型：
  - `anthropic/claude-3.5-sonnet` (推荐)
  - `anthropic/claude-3-haiku`
  - `anthropic/claude-3-opus`
  - `openai/gpt-4-turbo`
  - `google/gemini-pro-1.5`

## 配置步骤

### 步骤 1：获取 API Key

1. 访问对应提供商的官网
2. 注册账号并登录
3. 在设置页面创建新的 API Key
4. 复制 API Key（注意保密）

### 步骤 2：在 GanttXa 中配置

1. 点击"上传文件"按钮
2. 在文件上传对话框中，点击"AI 设置"按钮
3. 选择 API 提供商（Anthropic 或 OpenRouter）
4. 粘贴你的 API Key
5. 选择要使用的模型
6. 点击"保存设置"

### 步骤 3：上传文件解析

配置完成后，即可上传 Excel、Word 或 CSV 文件进行 AI 解析。

## 数据隐私说明

- API Key 仅存储在您的浏览器本地存储中
- 不会上传到 GanttXa 服务器
- 文件解析时，前端直接调用 AI API
- 您可以随时清除本地存储的 API Key

## 费用说明

### Anthropic 官方定价

- Claude 3.5 Sonnet: $3/M tokens (输入), $15/M tokens (输出)
- Claude 3 Haiku: $0.25/M tokens (输入), $1.25/M tokens (输出)

### OpenRouter 定价

- 价格通常比官方便宜 10-30%
- 详细价格：https://openrouter.ai/models

### 预估成本

一个典型的项目文件（50 个任务）：
- 输入：约 2,000 tokens
- 输出：约 1,500 tokens
- 使用 Claude 3.5 Sonnet：约 $0.03/次
- 使用 Claude 3 Haiku：约 $0.002/次

## 常见问题

### Q: 为什么要用户自己提供 API Key？

A: 这样可以：
1. 保护用户数据隐私（API Key 不经过我们的服务器）
2. 让用户自主控制 AI 使用成本
3. 避免服务商限制和配额问题

### Q: API Key 安全吗？

A: API Key 仅存储在您的浏览器本地存储中，不会上传到任何服务器。建议：
- 定期更换 API Key
- 不要在公共电脑上保存 API Key
- 使用完毕后可以清除设置

### Q: 支持其他 AI 模型吗？

A: 目前支持 Anthropic Claude 系列和通过 OpenRouter 访问的其他模型。未来会添加更多提供商支持。

### Q: 解析失败怎么办？

A: 请检查：
1. API Key 是否正确
2. 账户余额是否充足
3. 文件格式是否符合要求
4. 网络连接是否正常

## 推荐配置

对于大多数用户，我们推荐：

- 提供商：OpenRouter
- 模型：`anthropic/claude-3.5-sonnet`
- 原因：性价比高，解析准确度好

对于预算有限的用户：

- 提供商：OpenRouter
- 模型：`anthropic/claude-3-haiku`
- 原因：价格便宜，速度快，准确度尚可
