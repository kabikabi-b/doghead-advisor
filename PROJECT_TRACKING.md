# PROJECT_TRACKING.md - 项目跟踪

## Bug 记录

| ID | 描述 | 严重度 | 状态 | 发现时间 | 修复时间 |
|----|------|--------|------|----------|----------|
| BUG-001 | 社群页面点击报错 - questions collection 不存在 | S1 | 🔴 待修复 | 2026-02-07 17:44 | - |

### BUG-001 详情
- **问题**: 点击社群页面报错 `database collection not exists | questions`
- **原因**: `questions`、`votes`、`answers` collection 未在云开发环境创建
- **复现步骤**: 打开小程序 → 点击社群 tab
- **预期**: 正常加载问题列表
- **实际**: 报错 collection 不存在
- **建议**: 创建数据库初始化云函数或部署脚本

## 任务记录

| ID | 描述 | 状态 | 负责人 | 创建时间 | 完成时间 |
|----|------|------|--------|----------|----------|
| TASK-001 | 创建数据库初始化云函数 initDb | 🔴 待修复 | @KabiKabiYaaa_bot | 2026-02-07 17:52 | - |

## 配置信息

- **Staging 环境ID**: `cloud1-8ge51kis0d4af40b`
- **AppID**: `wx3ae4dfecd97351ea`

## 变更日志

### 2026-02-07
- 发现 BUG-001: 社群页面因 questions collection 不存在而报错
