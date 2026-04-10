import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

export interface ParsedTask {
  name: string
  startDate: string
  endDate: string | null
  assignee: string
  phase: string
  description?: string
  confidence: number
}

export interface ParseResult {
  tasks: ParsedTask[]
  fieldMapping: Record<string, string>
  warnings?: string[]
}

const PARSE_PROMPT = `你是一个项目管理文件解析专家。请分析以下文件内容，提取项目任务信息。

## 输出要求
返回 JSON 格式，结构如下：
{
  "tasks": [
    {
      "name": "任务名称",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "assignee": "负责人",
      "phase": "所属阶段",
      "description": "任务说明",
      "confidence": 0.95
    }
  ],
  "fieldMapping": {
    "原始列名1": "name",
    "原始列名2": "startDate",
    "原始列名3": "endDate",
    "原始列名4": "assignee",
    "原始列名5": "phase"
  },
  "warnings": ["可选的警告信息"]
}

## 识别规则
1. **日期格式**：识别常见格式（YYYY-MM-DD, MM/DD/YYYY, YYYY年MM月DD日等），统一转换为 YYYY-MM-DD
2. **阶段分组**：识别合并单元格、缩进、编号等层级结构
3. **置信度**：
   - >0.9: 字段匹配明确
   - 0.5-0.9: 模糊匹配，需要人工确认
   - <0.5: 无法确定，标记为低置信度
4. **容错**：忽略空行、注释行、汇总行
5. **负责人**：识别姓名、邮箱、工号等
6. **任务名称**：去除编号、特殊字符

## 字段映射规则
- 任务名称：任务、工作项、活动、事项、Task、Activity
- 开始日期：开始时间、起始日期、Start Date、Begin
- 结束日期：结束时间、完成日期、End Date、Finish
- 负责人：责任人、执行人、Assignee、Owner、负责方
- 阶段：阶段、Phase、里程碑、Milestone、分组

## 注意事项
- 如果某个字段无法识别，confidence 设为 0
- 如果日期格式无法解析，在 warnings 中说明
- 保持原始数据的完整性，不要遗漏任务`

export const parseFileWithAI = async (
  fileContent: string,
  fileName: string
): Promise<ParseResult> => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${PARSE_PROMPT}\n\n## 文件名\n${fileName}\n\n## 文件内容\n${fileContent}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // 提取 JSON（可能被包裹在 markdown 代码块中）
    let jsonText = content.text.trim()
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    const result = JSON.parse(jsonText) as ParseResult

    // 验证结果
    if (!result.tasks || !Array.isArray(result.tasks)) {
      throw new Error('Invalid parse result: missing tasks array')
    }

    if (!result.fieldMapping || typeof result.fieldMapping !== 'object') {
      throw new Error('Invalid parse result: missing fieldMapping')
    }

    // 验证每个任务的必填字段
    result.tasks.forEach((task, index) => {
      if (!task.name) {
        throw new Error(`Task ${index + 1}: missing name`)
      }
      if (!task.startDate) {
        throw new Error(`Task ${index + 1}: missing startDate`)
      }
      if (task.confidence === undefined || task.confidence < 0 || task.confidence > 1) {
        task.confidence = 0.5 // 默认置信度
      }
    })

    return result
  } catch (error: any) {
    console.error('AI parsing error:', error)
    throw new Error(`AI 解析失败: ${error.message}`)
  }
}

export const validateParseResult = (result: ParseResult): string[] => {
  const errors: string[] = []

  if (result.tasks.length === 0) {
    errors.push('未识别到任何任务')
  }

  result.tasks.forEach((task, index) => {
    if (!task.name || task.name.trim().length === 0) {
      errors.push(`任务 ${index + 1}: 缺少任务名称`)
    }

    if (!task.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(task.startDate)) {
      errors.push(`任务 ${index + 1}: 开始日期格式错误`)
    }

    if (task.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(task.endDate)) {
      errors.push(`任务 ${index + 1}: 结束日期格式错误`)
    }

    if (task.confidence < 0.5) {
      errors.push(`任务 ${index + 1}: 置信度过低 (${task.confidence})，建议人工检查`)
    }
  })

  return errors
}

export const calculateAccuracy = (result: ParseResult): number => {
  if (result.tasks.length === 0) return 0

  const totalConfidence = result.tasks.reduce((sum, task) => sum + task.confidence, 0)
  return totalConfidence / result.tasks.length
}
