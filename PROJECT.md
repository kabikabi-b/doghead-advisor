# 狗头军师 (Dog Head Strategist)

> AI 无厘头回复 + 匿名社群

## 📌 项目信息

| Field | Value |
|-------|-------|
| Platform | WeChat Mini Program |
| Concept | 无厘头 AI 回复 + 匿名社群 |
| GitHub | `kabikabi-b/doghead-advisor` |
| Priority | 🔴 High |
| AI Model | MiniMax API |
| Status | ✅ MVP 开发完成 |

---

## 🎨 UI Design (西高地主题)

### 配色方案
| 用途 | 颜色 | 色值 |
|------|------|------|
| 主背景 | 米色 | `#F5F5DC` |
| 卡片背景 | 白色 | `#FFFFFF` |
| 主文字 | 深棕色 | `#5D4037` |
| 次要文字 | 浅棕色 | `#8D6E63` |
| 强调色 | 橙色 | `#FF8A65` |
| 按钮色 | 棕色 | `#8B4513` |
| 成功色 | 绿色 | `#81C784` |

### 吉祥物
- **形象**: 西高地白梗（West Highland White Terrier）
- **配色**: 白色 + 米色 + 棕色
- **风格**: 活泼、可爱、搞笑

### UI 状态
- ✅ 首页 UI（提问卡片）
- ✅ 结果页 UI（AI 回复展示）
- ✅ 历史记录页 UI
- ❌ 狗头像 UI（待定）

---

## 📋 MVP 功能范围

### ✅ 已完成

#### 1. 首页 (pages/index)
- [x] 西高地白梗主题卡片
- [x] 输入问题
- [x] "🔮 生成无厘头回复" 按钮
- [x] 热门问题示例
- [x] 历史记录入口

#### 2. 结果页 (pages/result)
- [x] 显示问题和 AI 回复
- [x] "📋 一键复制" 按钮
- [x] "👍 点赞" 按钮
- [x] "🔄 再问一个" 按钮
- [x] 返回首页

#### 3. 历史记录页 (pages/history)
- [x] 展示历史问答
- [x] 点击查看详情
- [x] 空状态提示

#### 4. 云函数 (cloudfunctions/generateReply)
- [x] 调用 MiniMax API
- [x] 无厘头风格 prompt
- [x] 备用回复机制

### 按钮跳转逻辑
- ✅ 首页 [🔮 生成] → 结果页
- ✅ 结果页 [🔄 再问] → 首页
- ✅ 结果页 [← 返回] → 首页

---

## 🚀 开发计划

### ✅ Phase 1: MVP - 已完成
- [x] 首页 UI（提问卡片）
- [x] 结果页 UI（AI 回复展示）
- [x] 历史记录页
- [x] AI 集成（MiniMax 无厘头 prompt）

### Phase 2: 社群
- [ ] 热门问题列表
- [ ] 点赞系统
- [ ] 用户收藏

### Phase 3: 优化
- [ ] 狗头像 UI 定稿
- [ ] 动画效果
- [ ] 分享功能

---

## 📂 项目结构

```
doghead-advisor/
├── app.js              # 应用入口 ✓
├── app.json            # 路由配置 ✓
├── app.wxss            # 全局样式 ✓
├── sitemap.json        # SEO 配置 ✓
├── pages/
│   ├── index/          # 首页（提问）✓
│   │   ├── index.wxml ✓
│   │   ├── index.wxss ✓
│   │   ├── index.js   ✓
│   │   └── index.json ✓
│   ├── result/        # 结果页 ✓
│   │   ├── result.wxml ✓
│   │   ├── result.wxss ✓
│   │   ├── result.js  ✓
│   │   └── result.json ✓
│   └── history/       # 历史记录 ✓
│       ├── history.wxml ✓
│       ├── history.wxss ✓
│       ├── history.js ✓
│       └── history.json ✓
├── components/         # 公共组件
├── images/            # 图片资源
└── cloudfunctions/   # 云函数 ✓
    └── generateReply/ # AI 回复生成 ✓
        ├── index.js   ✓
        └── config.json ✓
```

---

## 🔧 部署说明

### 1. 导入微信开发者工具
- 打开微信开发者工具
- 导入项目目录: `~/projects/doghead-advisor/`

### 2. 开通云开发
- 在开发者工具中点击「云开发」
- 创建环境，获取环境 ID
- 更新 `app.js` 中的环境 ID

### 3. 部署云函数
- 右键点击 `cloudfunctions/generateReply`
- 选择「上传并部署：云端安装依赖」

### 4. 配置 MiniMax API
- 在云函数环境变量中设置 `MINIMAX_API_KEY`
- 或直接编辑 `cloudfunctions/generateReply/index.js`

## 🧪 E2E 自动化测试 - ✅ 已配置

| Field | Value |
|-------|-------|
| 测试框架 | miniprogram-automator + Jest |
| 测试脚本 | `npm run test:e2e` |
| 测试覆盖率 | 首页、结果页、历史记录页 |
| 配置文件 | `tests/jest.config.js` |

### 运行测试

```bash
cd tests
npm install
npm run test:e2e
```

### 测试文件

| 文件 | 描述 |
|------|------|
| `tests/e2e/index.spec.js` | 首页测试 |
| `tests/e2e/result.spec.js` | 结果页测试 |
| `tests/e2e/history.spec.js` | 历史记录页测试 |

### 测试覆盖

- [x] 页面加载成功
- [x] 输入功能
- [x] 按钮点击跳转
- [x] 点赞功能
- [x] 复制功能
- [x] 空状态显示

### 相关文档
- [README.md](README.md) - 测试使用说明

---

## 🐕 狗头像设计 (待定)

### 问题
- 形象如何融入 UI？
- 动画效果？

### 待确认
- [ ] 狗头像样式（卡通/写实/简笔画）
- [ ] 动画（点头/摇头/眨眼）
- [ ] 位置（固定顶部/浮动/每次随机）

---

## 📂 项目结构

```
doghead-advisor/
├── app.js              # 应用入口
├── app.json            # 路由配置
├── app.wxss            # 全局样式
├── pages/
│   ├── index/          # 首页（提问）
│   ├── result/        # 结果页
│   └── history/       # 历史记录
├── components/        # 公共组件
├── images/           # 图片资源
└── cloudfunctions/   # 云函数
    └── generateReply/ # AI 回复生成
```

---

## 🔧 技术栈

- 微信小程序
- 微信云开发
- MiniMax API（无厘头风格）

---

## 💬 微信审核注意事项

- 避免 "算命"、"运势" 等敏感词
- 定位为 "趣味对话"、"搞笑助手"
