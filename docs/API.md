# GanttFlow API 文档

## 基础信息

- 基础 URL: `http://localhost:3000`
- 认证方式: JWT Bearer Token
- 响应格式: JSON

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "message": "错误信息"
  }
}
```

## 认证 API

### 用户注册
```
POST /api/auth/register
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "张三"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "张三"
    },
    "token": "jwt_token"
  }
}
```

### 用户登录
```
POST /api/auth/login
```

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：** 同注册

## 项目 API

所有项目 API 需要认证（Header: `Authorization: Bearer <token>`）

### 获取项目列表
```
GET /api/projects
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "项目名称",
      "description": "项目描述",
      "createdAt": "2026-04-10T...",
      "updatedAt": "2026-04-10T..."
    }
  ]
}
```

### 创建项目
```
POST /api/projects
```

**请求体：**
```json
{
  "name": "新项目",
  "description": "项目描述"
}
```

### 获取项目详情
```
GET /api/projects/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "项目名称",
    "description": "项目描述",
    "tasks": [...],
    "createdAt": "2026-04-10T...",
    "updatedAt": "2026-04-10T..."
  }
}
```

### 更新项目
```
PUT /api/projects/:id
```

**请求体：**
```json
{
  "name": "更新后的名称",
  "description": "更新后的描述"
}
```

### 删除项目
```
DELETE /api/projects/:id
```

## 任务 API

### 批量创建/更新任务
```
POST /api/projects/:id/tasks
```

**请求体：**
```json
{
  "tasks": [
    {
      "id": "uuid (可选，更新时提供)",
      "name": "任务名称",
      "startDate": "2026-04-10",
      "endDate": "2026-04-20",
      "assignee": "张三",
      "phase": "阶段一",
      "description": "任务描述",
      "isMilestone": false,
      "dependencies": [],
      "position": 0
    }
  ]
}
```

### 获取项目任务
```
GET /api/projects/:id/tasks
```

### 更新单个任务
```
PUT /api/tasks/:id
```

**请求体：**
```json
{
  "name": "更新后的任务名称",
  "startDate": "2026-04-10",
  "endDate": "2026-04-20",
  "assignee": "李四",
  "phase": "阶段二",
  "description": "更新后的描述",
  "isMilestone": true
}
```

### 删除任务
```
DELETE /api/tasks/:id
```

### 批量删除任务
```
POST /api/tasks/batch-delete
```

**请求体：**
```json
{
  "taskIds": ["uuid1", "uuid2", "uuid3"]
}
```

## 分享 API

### 生成分享链接
```
POST /api/projects/:id/share
```

**请求体：**
```json
{
  "permission": "view",  // view | comment | edit
  "expiresAt": "2026-05-10T00:00:00Z"  // 可选
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "random_token_string",
    "url": "http://localhost:5173/share/random_token_string",
    "permission": "view",
    "expiresAt": "2026-05-10T00:00:00Z"
  }
}
```

### 获取分享项目
```
GET /api/share/:token
```

**响应：** 返回项目完整数据（无需认证）

### 更新分享权限
```
PUT /api/share/:token/permissions
```

**请求体：**
```json
{
  "permission": "edit",
  "expiresAt": "2026-06-10T00:00:00Z"
}
```

### 撤销分享链接
```
DELETE /api/share/:token
```

## 健康检查

### 服务状态
```
GET /health
```

**响应：**
```json
{
  "success": true,
  "message": "GanttFlow API is running",
  "timestamp": "2026-04-10T...",
  "environment": "development"
}
```

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## 示例：使用 curl 测试

```bash
# 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","displayName":"测试用户"}'

# 登录获取 token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}' \
  | jq -r '.data.token')

# 创建项目
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"我的项目","description":"测试项目"}'

# 获取项目列表
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN"
```
