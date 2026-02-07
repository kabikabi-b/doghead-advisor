# 狗头军师 E2E 测试框架完善 + MVP 开发任务

## 任务目标
完善狗狗军师小程序的 E2E 测试框架，开发 MVP 功能，然后继续测试验证。

## 当前状态
- 项目路径: `/Users/jr/.openclaw/workspace/projects/doghead-advisor/`
- 当前分支: `feature/doghead-testing`
- 现有页面: index, result, history
- 缺失页面: community, leaderboard, profile
- 测试文件: 已存在部分测试，但需要完善

## 阶段 1: 完善测试框架

### 1.1 创建缺失的页面
创建以下页面及其完整功能：
- `pages/community/` - 匿名社群页面
  - 热门问题列表
  - 点赞功能
  - 筛选（最新/最热）
  - 下拉刷新/触底加载

- `pages/leaderboard/` - 排行榜页面
  - 用户排名列表
  - 咕咕率统计
  - 榜首特殊展示
  - 筛选功能

- `pages/profile/` - 个人中心页面
  - 用户信息展示
  - 统计数据（提问数、点赞数、咕咕率）
  - 历史提问列表
  - 下拉刷新

### 1.2 完善测试文件
为每个页面创建完整测试：

**community.spec.js (已存在，需要完善)**
- 页面加载测试
- 筛选功能测试
- 问题卡片交互测试
- 点赞功能测试
- 下拉刷新测试
- 触底加载测试
- Mock 云数据库调用

**leaderboard.spec.js (已存在，需要完善)**
- 页面加载测试
- 数据绑定测试
- 榜首展示测试
- 排名列表测试
- 用户排名测试
- 筛选功能测试
- 下拉刷新测试

**profile.spec.js (已存在，需要完善)**
- 页面加载测试
- 用户信息展示测试
- 统计数据展示测试
- 历史提问测试
- 数据获取测试
- 下拉刷新测试

### 1.3 完善 Mock 工具
更新 `tests/e2e/utils/mock-wx.js`:
- 完善所有微信 API Mock
- Mock 云数据库调用
- Mock 云函数调用
- Mock 存储操作

### 1.4 运行测试并修复失败用例
```bash
cd /Users/jr/.openclaw/workspace/projects/doghead-advisor/tests
npm install
npm run test:e2e
```

目标：测试覆盖率 > 70%，所有测试通过

## 阶段 2: 开发 MVP

### 2.1 完善页面业务逻辑

**community 页面 (pages/community/)**
```javascript
// community.js
Page({
  data: {
    filter: 'latest', // latest | hot
    questions: [],
    page: 1,
    loading: false
  },

  onLoad() {
    this.loadQuestions();
  },

  onShow() {
    this.refreshData();
  },

  // 加载问题列表
  loadQuestions() {
    const db = wx.cloud.database();
    const _ = db.command;
    
    db.collection('questions')
      .where(_.exists(true))
      .orderBy('createTime', this.data.filter === 'latest' ? 'desc' : 'desc')
      .limit(20)
      .skip((this.data.page - 1) * 20)
      .get()
      .then(res => {
        this.setData({
          questions: [...this.data.questions, ...res.data],
          loading: false
        });
      });
  },

  // 筛选
  onFilterTap(e) {
    const { filter } = e.currentTarget.dataset;
    this.setData({ filter, questions: [], page: 1 });
    this.loadQuestions();
  },

  // 点赞
  onVote(e) {
    const { type, id } = e.currentTarget.dataset;
    wx.cloud.callFunction({
      name: 'vote',
      data: { type, id },
      success: () => {
        // 更新本地状态
      }
    });
  },

  onPullDownRefresh() {
    this.setData({ page: 1, questions: [] });
    this.loadQuestions().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    this.setData({ page: this.data.page + 1 });
    this.loadQuestions();
  }
});
```

**leaderboard 页面 (pages/leaderboard/)**
```javascript
// leaderboard.js
Page({
  data: {
    rankList: [],
    currentUserRank: null,
    filter: 'likes' // likes | guguRate
  },

  onLoad() {
    this.loadRankList();
  },

  onShow() {
    this.refreshData();
  },

  // 加载排行榜
  loadRankList() {
    wx.cloud.callFunction({
      name: 'getLeaderboard',
      data: { filter: this.data.filter }
    }).then(res => {
      this.setData({
        rankList: res.result.list,
        currentUserRank: res.result.currentUserRank
      });
    });
  },

  // 筛选
  onFilterTap(e) {
    const { filter } = e.currentTarget.dataset;
    this.setData({ filter });
    this.loadRankList();
  },

  onPullDownRefresh() {
    this.loadRankList().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});
```

**profile 页面 (pages/profile/)**
```javascript
// profile.js
Page({
  data: {
    userInfo: null,
    stats: {
      totalQuestions: 0,
      totalLikes: 0,
      guguRate: 0
    },
    myQuestions: []
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    this.refreshData();
  },

  // 加载用户数据
  loadUserData() {
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      this.setData({
        userInfo: res.result.userInfo,
        stats: res.result.stats,
        myQuestions: res.result.myQuestions
      });
    });
  },

  onPullDownRefresh() {
    this.loadUserData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 跳转到问题详情
  onQuestionTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/result/result?id=${id}`
    });
  }
});
```

### 2.2 创建云函数

**getLeaderboard 云函数**
```javascript
// cloudfunctions/getLeaderboard/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { filter = 'likes' } = event;
  
  // 获取排行榜
  const users = await db.collection('users')
    .orderBy(filter, 'desc')
    .limit(100)
    .get();
    
  // 获取当前用户排名
  const wxContext = cloud.getWXContext();
  const currentUser = await db.collection('users')
    .where({ openid: wxContext.OPENID })
    .get();
    
  return {
    success: true,
    list: users.data,
    currentUserRank: currentUser.data[0]
  };
};
```

**vote 云函数**
```javascript
// cloudfunctions/vote/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { type, id } = event; // type: 'question' | 'answer'
  const wxContext = cloud.getWXContext();
  
  const collectionName = type === 'question' ? 'questions' : 'answers';
  
  try {
    // 检查是否已点赞
    const voteRecord = await db.collection('votes')
      .where({
        openid: wxContext.OPENID,
        targetId: id,
        targetType: type
      })
      .get();
      
    if (voteRecord.data.length > 0) {
      // 取消点赞
      await db.collection('votes').doc(voteRecord.data[0]._id).remove();
      await db.collection(collectionName).doc(id).update({
        data: { likes: db.command.inc(-1) }
      });
      return { success: true, action: 'unlike' };
    } else {
      // 添加点赞
      await db.collection('votes').add({
        data: {
          openid: wxContext.OPENID,
          targetId: id,
          targetType: type,
          createTime: new Date()
        }
      });
      await db.collection(collectionName).doc(id).update({
        data: { likes: db.command.inc(1) }
      });
      return { success: true, action: 'like' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

**getUserProfile 云函数**
```javascript
// cloudfunctions/getUserProfile/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  // 获取或创建用户
  let user = await db.collection('users')
    .where({ openid: wxContext.OPENID })
    .get();
    
  if (user.data.length === 0) {
    // 创建新用户
    await db.collection('users').add({
      data: {
        openid: wxContext.OPENID,
        createTime: new Date(),
        stats: {
          totalQuestions: 0,
          totalLikes: 0,
          guguRate: 0
        }
      }
    });
    user = await db.collection('users').where({ openid: wxContext.OPENID }).get();
  }
  
  // 获取用户的问题
  const questions = await db.collection('questions')
    .where({ openid: wxContext.OPENID })
    .orderBy('createTime', 'desc')
    .limit(20)
    .get();
    
  return {
    success: true,
    userInfo: user.data[0],
    stats: user.data[0].stats,
    myQuestions: questions.data
  };
};
```

### 2.3 更新 app.json
```json
{
  "pages": [
    "pages/index/index",
    "pages/result/result",
    "pages/history/history",
    "pages/community/community",
    "pages/leaderboard/leaderboard",
    "pages/profile/profile"
  ],
  "window": {
    "navigationBarTitleText": "狗头军师"
  },
  "tabBar": {
    "color": "#8D6E63",
    "selectedColor": "#FF8A65",
    "backgroundColor": "#F5F5DC",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/community/community",
        "text": "社群",
        "iconPath": "images/community.png",
        "selectedIconPath": "images/community-active.png"
      },
      {
        "pagePath": "pages/leaderboard/leaderboard",
        "text": "排行榜",
        "iconPath": "images/leaderboard.png",
        "selectedIconPath": "images/leaderboard-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/profile.png",
        "selectedIconPath": "images/profile-active.png"
      }
    ]
  }
}
```

## 阶段 3: 继续测试

### 3.1 为新功能添加测试
- 测试云函数调用
- 测试数据库操作
- 测试点赞功能
- 测试筛选功能

### 3.2 运行完整测试套件
```bash
npm run test:e2e
```

### 3.3 修复失败的测试
- 分析失败原因
- 修复代码或测试
- 确保所有测试通过

## 验收标准

1. **测试框架完善**
   - 4个页面都有完整测试
   - 所有微信API都有Mock
   - 测试覆盖率 > 70%
   - 所有测试通过

2. **MVP开发完成**
   - 4个页面都有完整的业务逻辑
   - 云函数（generateReply, getLeaderboard, vote, getUserProfile）已创建
   - 云数据库调用已配置
   - 点赞、筛选等功能已实现

3. **文档更新**
   - PROJECTS.md 已更新
   - MEMORY.md 已更新
   - Git commit + push 完成

## 执行步骤

1. 创建缺失的页面文件（community, leaderboard, profile）
2. 完善测试文件
3. 创建云函数
4. 更新 app.json
5. 运行测试
6. 修复失败
7. 更新文档
8. Git commit + push

## 完成后输出

1. 完成的代码文件清单
2. 测试运行结果
3. 更新的文档链接
