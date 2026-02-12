// pages/profile/profile.js

const fortunes = [
  { text: '今日宜摸鱼，不宜加班', advice: '建议：假装很忙的样子' },
  { text: '今日运势爆棚，适合买彩票', advice: '建议：先把欠的钱还了' },
  { text: '今日桃花运旺盛', advice: '建议：照照镜子冷静一下' },
  { text: '今日不宜做重大决定', advice: '建议：午饭吃什么除外' },
  { text: '今日适合躺平', advice: '建议：找个舒服的姿势' },
  { text: '今日贵人运极佳', advice: '建议：先确认不是债主' },
  { text: '今日财运亨通', advice: '建议：别看余额就行' },
  { text: '今日适合学习新技能', advice: '建议：比如怎么准时下班' },
  { text: '今日运势一般般', advice: '建议：保持低调就好' },
  { text: '今日灵感爆发', advice: '建议：赶紧记下来再忘了' }
];

Page({
  data: {
    userInfo: null,
    userId: '未登录',
    fortune: '',
    advice: '',
    todayCount: 0,
    stats: {
      totalQuestions: 0,
      totalLikes: 0,
      totalViews: 0,
      daysActive: 0
    },
    myQuestions: [],
    darkMode: false,
    refreshing: false,
    contentPaddingTop: 0
  },

  onLoad() {
    // 内容区起始位置在胶囊按钮下方
    const menuBtn = wx.getMenuButtonBoundingClientRect();
    this.setData({ contentPaddingTop: menuBtn.bottom + 12 });

    this.pickFortune();
    this.loadUserData();
  },

  onShow() {
    this.loadUserData();
  },

  // 随机选择运势
  pickFortune() {
    const f = fortunes[Math.floor(Math.random() * fortunes.length)];
    this.setData({
      fortune: f.text,
      advice: f.advice
    });
  },

  // 加载用户数据
  loadUserData() {
    // 本地用户信息
    const localUserInfo = wx.getStorageSync('userInfo');
    if (localUserInfo) {
      this.setData({
        userInfo: localUserInfo,
        userId: (localUserInfo._id || localUserInfo._openid || '').slice(-8) || '未登录'
      });
    }

    // 从云端加载
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      console.log('[profile] getUserProfile:', res.result);
      if (res.result) {
        if (res.result.userInfo) {
          const info = res.result.userInfo;
          this.setData({
            userInfo: info,
            userId: (info._id || info._openid || '').slice(-8) || '未登录'
          });
          wx.setStorageSync('userInfo', info);
        }
        if (res.result.stats) {
          this.setData({ stats: res.result.stats });
        }
        if (res.result.todayCount !== undefined) {
          this.setData({ todayCount: res.result.todayCount });
        }
      }
      this.setData({ refreshing: false });
    }).catch(err => {
      console.error('[profile] getUserProfile 失败:', err);
      this.setData({ refreshing: false });
    });

    // 加载最近提问
    this.loadRecentQuestions();
  },

  // 加载最近提问
  loadRecentQuestions() {
    const db = wx.cloud.database();
    db.collection('questions')
      .orderBy('createTime', 'desc')
      .limit(5)
      .get()
      .then(res => {
        const questions = res.data.map(q => ({
          ...q,
          dateStr: this.formatTime(q.createTime)
        }));
        this.setData({ myQuestions: questions });
      })
      .catch(err => {
        console.error('[profile] 加载最近提问失败:', err);
      });
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return month + '-' + day;
  },

  // 跳转到历史
  navigateToHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  // 跳转到首页
  navigateToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  // 点击提问项
  onQuestionTap(e) {
    const { id } = e.currentTarget.dataset;
    const question = this.data.myQuestions.find(q => q._id === id);
    if (question) {
      wx.navigateTo({
        url: '/pages/result/result?question=' + encodeURIComponent(question.question) + '&reply=' + encodeURIComponent(question.reply) + '&id=' + id
      });
    }
  },

  // 切换主题
  toggleTheme() {
    this.setData({ darkMode: !this.data.darkMode });
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          this.setData({
            userInfo: null,
            userId: '未登录',
            stats: { totalQuestions: 0, totalLikes: 0, totalViews: 0, daysActive: 0 },
            myQuestions: [],
            todayCount: 0
          });
          wx.showToast({ title: '已退出', icon: 'success' });
        }
      }
    });
  },

  // 清除缓存
  handleClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      }
    });
  },

  // 设置相关
  handleSettings() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  handleFeedback() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  handleAgreement() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  handlePrivacy() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  handleAbout() {
    wx.showToast({ title: '狗狗军师 v2.0', icon: 'none' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.pickFortune();
    this.loadUserData();
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '狗狗军师 - 无厘头AI回复',
      path: '/pages/index/index'
    };
  }
});
