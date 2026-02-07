# PROJECT_TRACKING.md - 项目跟踪

## Bug 记录

| ID | 描述 | 严重度 | 状态 | 发现时间 | 修复时间 |
|----|------|--------|------|----------|----------|
| BUG-001 | 社群页面点击报错 - questions collection 不存在 | S1 | 🔴 待验证 | 2026-02-07 17:44 | - |
| BUG-002 | Tab Bar 显示黑色方块 - 图标文件缺失 | S2 | 🔴 待验证 | 2026-02-07 18:10 | - |
| BUG-003 | 按钮文字为"生成无厘头回复" 应改为"咨询狗哥" | S3 | ✅ 已修复 | 2026-02-07 18:15 | 2026-02-07 18:15 |
| BUG-004 | "咨询狗哥" 按钮点击无响应 | S1 | 🔴 待修复 | 2026-02-07 18:35 | - |
| BUG-005 | 我的页面"去提问"按钮点击无反应 - 缺少 goToIndex 方法 | S1 | 🔴 待修复 | 2026-02-07 19:21 | - |
| BUG-006 | 排行榜出现"咕咕率"概念 - 另一个项目概念需移除 | S2 | 🔴 待修复 | 2026-02-07 19:21 | - |
| BUG-007 | 狗狗军师 Logo 太丑 - 需要西高地白梗卡通头像 | S3 | 🔴 待修复 | 2026-02-07 19:21 | - |
| BUG-008 | 咨询狗哥后社群内没有显示最新问题 | S1 | 🔴 待修复 | 2026-02-07 19:21 | - |

### BUG-001 详情
- **问题**: 点击社群页面报错 `database collection not exists | questions`
- **原因**: `questions`、`votes`、`answers` collection 未在云开发环境创建
- **复现步骤**: 打开小程序 → 点击社群 tab
- **预期**: 正常加载问题列表
- **实际**: 报错 collection 不存在
- **修复**: initDb 云函数已创建，等待部署验证

### BUG-002 详情
- **问题**: Tab Bar 显示四个黑色方块
- **原因**: `images/` 目录为空，图标文件缺失
- **修复**: 已生成 8 个彩色 Tab Bar 图标并提交

### BUG-003 详情
- **问题**: 按钮文字为"生成无厘头回复"
- **修复**: 已修改 `pages/index/index.wxml` 按钮文字为 "🔮 咨询狗哥"

### BUG-004 详情
- **问题**: 点击"咨询狗哥"按钮后无任何响应
- **原因**: `generateReply` 云函数使用 `cloud.openapi.request` 调用第三方 API，方式错误
- **修复**: 需要改用 `axios` 调用 MiniMax API

### BUG-005 详情
- **问题**: 我的页面"去提问"按钮点击无反应
- **报错**: `Component "pages/profile/profile" does not have a method "goToIndex" to handle event "tap"`
- **原因**: `profile.wxml` 调用 `goToIndex` 但 `profile.js` 没有定义此方法
- **修复**: 在 `profile.js` 中添加 `goToIndex` 方法跳转到首页

### BUG-006 详情
- **问题**: 排行榜显示"咕咕率"
- **原因**: "咕咕率"是另一个项目（鸽子日历）的概念，不适用于狗头军师
- **修复**: 从排行榜移除 guguRate 相关显示，改为其他有意义的数据

### BUG-007 详情
- **问题**: 狗狗军师 Logo 太丑
- **需求**: 西高地白梗 (West Highland White Terrier) 卡通头像
- **修复**: 重新生成西高地白梗 SVG 图标

### BUG-008 详情
- **问题**: 咨询狗哥后，社群页面没有显示最新问题
- **原因**: `generateReply` 云函数没有将问题保存到 `questions` collection
- **修复**: 在 `generateReply` 成功后，添加问题到 `questions` collection

## 任务记录

| ID | 描述 | 状态 | 负责人 | 创建时间 | 最后催促 |
|----|------|------|--------|----------|----------|
| TASK-001 | 部署 initDb 云函数并创建数据库集合 | 🔴 待修复 | @KabiKabiYaaa_bot | 2026-02-07 17:52 | - |
| TASK-002 | 修复 "咨询狗哥" 按钮 API 调用方式 (axios) | 🔴 待修复 | @KabiKabiYaaa_bot | 2026-02-07 18:35 | - |
| TASK-003 | 添加 profile.js 的 goToIndex 方法 | 🔴 待修复 | @KabiKabiYaaa_bot | 2026-02-07 19:21 | - |
| TASK-004 | 移除排行榜 guguRate 概念 | 🔴 待修复 | @KabiKabiYaaa_bot | 2026-02-07 19:21 | - |
| TASK-005 | 生成西高地白梗 Logo 图标 | 🔴 待修复 | @kabikabi2_bot | 2026-02-07 19:21 | - |
| TASK-006 | generateReply 添加保存问题到 collection | 🔴 待修复 | @KabiKabiYaaa_bot | 2026-02-07 19:21 | - |

## 配置信息

- **Staging 环境ID**: `cloud1-8ge51kis0d4af40b`
- **AppID**: `wx3ae4dfecd97351ea`

## 变更日志

### 2026-02-07
- 发现 BUG-001: 社群页面因 questions collection 不存在而报错
- 18:02 GMT+8 - James 直接指令 @KabiKabiYaaa_bot 立即修复 TASK-001 和 TASK-002
- 19:21 GMT+8 - James 反馈 6 个新问题
