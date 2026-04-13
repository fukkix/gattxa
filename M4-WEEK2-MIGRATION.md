# M4 第 2 周数据库迁移指南

**日期**: 2026-04-13  
**迁移文件**: `database/migrations/004_add_version_to_tasks.sql`

---

## 📋 迁移内容

本次迁移为 `tasks` 表添加 `version` 字段，用于实现乐观锁（Optimistic Locking）冲突检测。

---

## 🚀 执行迁移

### 方法 1: 使用 psql 命令行

```bash
cd gattxa
psql $DATABASE_URL -f database/migrations/004_add_version_to_tasks.sql
```

### 方法 2: 使用 Docker

如果使用 Docker Compose 运行数据库：

```bash
cd gattxa
docker-compose exec postgres psql -U <username> -d <database> -f /path/to/004_add_version_to_tasks.sql
```

### 方法 3: 手动执行 SQL

连接到数据库后，执行以下 SQL：

```sql
-- 添加版本号字段到任务表
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- 为现有任务设置初始版本号
UPDATE tasks SET version = 1 WHERE version IS NULL;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_version ON tasks(id, version);

-- 添加注释
COMMENT ON COLUMN tasks.version IS '任务版本号，用于冲突检测';
```

---

## ✅ 验证迁移

执行迁移后，验证字段是否添加成功：

```sql
-- 查看 tasks 表结构
\d tasks

-- 或者
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'version';
```

**预期结果**:
```
 column_name | data_type | column_default 
-------------+-----------+----------------
 version     | integer   | 1
```

---

## 🔄 回滚迁移

如果需要回滚此迁移：

```sql
-- 删除版本号字段
ALTER TABLE tasks DROP COLUMN IF EXISTS version;

-- 删除索引
DROP INDEX IF EXISTS idx_tasks_version;
```

---

## 📝 注意事项

1. **备份数据库**：执行迁移前建议备份数据库
2. **停止服务**：建议在迁移期间停止后端服务
3. **现有数据**：所有现有任务的版本号将设置为 1
4. **索引创建**：大表可能需要较长时间创建索引

---

## 🧪 测试迁移

迁移完成后，测试版本号功能：

```sql
-- 创建测试任务
INSERT INTO tasks (project_id, name, assignee, phase, version)
VALUES ('test-project', 'Test Task', 'Test User', 'Phase 1', 1)
RETURNING *;

-- 更新任务（版本号应该递增）
UPDATE tasks 
SET name = 'Updated Task', version = version + 1
WHERE id = '<task-id>' AND version = 1
RETURNING *;

-- 验证版本号已更新为 2
SELECT id, name, version FROM tasks WHERE id = '<task-id>';
```

---

## 📊 影响范围

### 数据库
- ✅ 添加 `version` 字段
- ✅ 添加索引 `idx_tasks_version`
- ✅ 更新现有数据

### 后端
- ✅ `Task` 模型已更新
- ✅ `createTask` 函数已更新
- ✅ `updateTask` 函数已更新
- ✅ `batchCreateOrUpdateTasks` 函数已更新

### 前端
- ✅ `Task` 类型已更新
- ✅ 状态管理已更新
- ✅ WebSocket 事件已更新

---

## 🔍 故障排查

### 问题 1: 字段已存在

**错误信息**:
```
ERROR: column "version" of relation "tasks" already exists
```

**解决方法**:
迁移脚本使用了 `IF NOT EXISTS`，此错误不应出现。如果出现，说明字段已存在，可以跳过此迁移。

---

### 问题 2: 权限不足

**错误信息**:
```
ERROR: permission denied for table tasks
```

**解决方法**:
确保数据库用户有 ALTER TABLE 权限：
```sql
GRANT ALL PRIVILEGES ON TABLE tasks TO <username>;
```

---

### 问题 3: 索引创建失败

**错误信息**:
```
ERROR: could not create index
```

**解决方法**:
1. 检查磁盘空间
2. 检查表是否被锁定
3. 尝试手动创建索引

---

## 📞 需要帮助？

如果遇到问题，请查看：
- [M4 第 2 周完成报告](M4-WEEK2-COMPLETE.md)
- [开发进度报告](DEVELOPMENT-PROGRESS.md)
- PostgreSQL 官方文档

---

**迁移版本**: 004  
**创建日期**: 2026-04-13  
**状态**: ⏳ 待执行

