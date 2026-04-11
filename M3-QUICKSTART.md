# M3 阶段快速开始指南

**版本**: 1.1.0  
**更新日期**: 2026-04-11

---

## 🎉 欢迎使用 M3 新功能！

M3 阶段为 GanttXa 带来了强大的协作和导出功能。本指南将帮助您快速上手。

---

## 📋 前置要求

确保您已经完成 M1 和 M2 阶段的设置：
- ✅ 数据库已初始化
- ✅ 前后端服务正常运行
- ✅ 已注册用户账号

---

## 🚀 快速开始

### 1. 更新数据库

M3 阶段需要添加 comments 表。

**方式一：重新初始化数据库（推荐）**
```bash
# Windows
.\scripts\init-db.ps1

# Linux/Mac
./scripts/init-db.sh
```

**方式二：执行迁移脚本**
```bash
# Windows
.\scripts\migrate-m3.ps1

# Linux/Mac
./scripts/migrate-m3.sh
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

这会自动安装新增的 `jspdf` 依赖。

### 3. 重启服务

```bash
# 后端
cd backend
npm run dev

# 前端（新终端）
cd frontend
npm run dev
```

---

## 💬 使用评论功能

### 创建评论

1. 登录到 GanttXa
2. 打开一个项目
3. 在任务列表中，悬停在任务上
4. 点击"评论"按钮（💬 图标）
5. 在弹出的对话框中输入评论
6. 点击"发送评论"

### @ 提及用户

在评论中输入 `@用户名` 即可提及其他用户：

```
@张三 这个任务需要你的帮助
```

被提及的用户会在系统中收到通知（API 已实现，UI 待完善）。

### 编辑和删除评论

- 点击评论右上角的"编辑"图标可以修改评论
- 点击"删除"图标可以删除评论
- 只能编辑和删除自己的评论

---

## 📑 使用 PDF 导出

### 导出项目为 PDF

1. 在编辑器页面点击"导出"按钮
2. 选择"PDF 文档"选项
3. 点击"导出"按钮
4. PDF 文件会自动下载

### PDF 内容

导出的 PDF 包含：
- 项目名称和导出日期
- 高清甘特图图片
- 完整的任务列表表格
- 页码

---

## ⚡ 使用性能测试工具

### 运行性能测试

1. 访问 http://localhost:5173/performance-test
2. 选择要测试的任务数量：
   - 50 任务
   - 100 任务
   - 500 任务
   - 1000 任务
3. 点击按钮开始测试
4. 查看测试结果

### 性能目标

| 任务数量 | 目标时间 |
|---------|---------|
| 50 任务 | ≤ 200ms |
| 100 任务 | ≤ 500ms |
| 500 任务 | ≤ 2s |
| 1000 任务 | ≤ 5s |

---

## 🎯 功能演示

### 评论功能演示

```typescript
// 1. 创建一个任务
const task = await createTask({
  name: "开发评论功能",
  startDate: "2026-04-11",
  endDate: "2026-04-15",
  assignee: "张三",
  phase: "开发阶段"
})

// 2. 添加评论
const comment = await createComment(task.id, {
  content: "@李四 请帮忙 review 这个功能",
  mentions: ["李四"]
})

// 3. 查看评论
const comments = await getComments(task.id)
console.log(comments) // 显示所有评论
```

### PDF 导出演示

```typescript
// 导出当前项目为 PDF
await exportToPDF(
  projectName,
  tasks,
  canvasElement,
  `${projectName}_${timestamp}.pdf`
)
```

### 性能测试演示

```typescript
// 生成 100 个测试任务
const testTasks = generateTestTasks(100)

// 测量渲染性能
const duration = await measurePerformance(
  "渲染 100 个任务",
  async () => {
    for (const task of testTasks) {
      await addTask(task)
    }
  }
)

console.log(`性能: ${duration.toFixed(2)}ms`)
```

---

## 🔧 故障排查

### 评论功能无法使用

**问题**: 点击评论按钮没有反应

**解决方案**:
1. 检查是否已登录
2. 检查后端服务是否运行
3. 检查浏览器控制台是否有错误
4. 确认数据库中 comments 表已创建

### PDF 导出失败

**问题**: 点击导出按钮后没有下载

**解决方案**:
1. 检查浏览器是否阻止了下载
2. 检查是否有任务数据
3. 检查浏览器控制台错误
4. 确认 jspdf 依赖已安装

### 性能测试页面无法访问

**问题**: 访问 /performance-test 显示 404

**解决方案**:
1. 确认前端服务正在运行
2. 检查路由配置是否正确
3. 清除浏览器缓存并刷新

---

## 📚 相关文档

- [M3 功能详细文档](docs/M3-FEATURES.md)
- [M3 更新日志](CHANGELOG-M3.md)
- [API 文档](docs/API.md)
- [用户手册](docs/USER-GUIDE.md)

---

## 🎓 最佳实践

### 评论使用建议

1. **及时沟通**: 在任务上添加评论，保持团队沟通
2. **使用 @ 提及**: 需要特定人员关注时使用 @ 提及
3. **保持简洁**: 评论内容简洁明了
4. **定期清理**: 删除过时的评论

### PDF 导出建议

1. **导出前检查**: 确保甘特图显示正常
2. **命名规范**: 使用有意义的文件名
3. **定期备份**: 定期导出 PDF 作为备份
4. **分享使用**: 导出 PDF 便于与非系统用户分享

### 性能测试建议

1. **定期测试**: 在添加新功能后进行性能测试
2. **对比分析**: 记录测试结果，对比性能变化
3. **优化目标**: 根据测试结果优化性能瓶颈

---

## 🆘 获取帮助

### 问题反馈
- GitHub Issues: https://github.com/fukkix/gattxa/issues

### 功能建议
- GitHub Discussions: https://github.com/fukkix/gattxa/discussions

### 文档问题
- 查看完整文档：[docs/](docs/)
- 查看 API 文档：[docs/API.md](docs/API.md)

---

## 🎊 下一步

完成 M3 功能体验后，您可以：

1. ✅ 探索所有评论功能
2. ✅ 尝试 PDF 导出
3. ✅ 运行性能测试
4. ⏳ 等待 M4 阶段（实时协作）

---

**祝您使用愉快！** 🎉

如有任何问题，请随时联系我们。

---

**文档维护**: GanttXa Development Team  
**最后更新**: 2026-04-11  
**版本**: 1.1.0 (M3)
