// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    stats: {
      totalQuestions: 0,
      totalLikes: 0,
      guguRate: 0
    },
    myQuestions: [],
    loading: false
  },

  onLoad() {
    this.loadUserData();
  },

  onShow() {
    if (!this.data.userInfo) {
      this.loadUserData();
    }
  },

  // 加载用户数据
  loadUserData() {
    this.setData({ loading: true });

    const db = wx.cloud.database();
    const _ = db.command;

    // 1. 获取用户信息
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      if (res.result && res.result.userInfo) {
        this.setData({ userInfo: res.result.userInfo });
        wx.setStorageSync('userInfo', res.result.userInfo);
      }
    }).catch(() => {
      // 使用本地存储的用户
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
      } else {
        // 创建默认用户信息
        const defaultUser = {
          nickName: '狗狗用户',
          avatarUrl: '/images/dog-avatar/png/westie-cute.png'
        };
        this.setData({ userInfo: defaultUser });
        wx.setStorageSync('userInfo', defaultUser);
      }
    });

    // 2. 获取统计数据 - 从云数据库统计
    db.collection('questions').count().then(res => {
      const totalQuestions = res.total || 0;
      // 从本地历史记录统计
      const history = wx.getStorageSync('history') || [];
      
      this.setData({
        stats: {
          totalQuestions: totalQuestions,
          totalLikes: history.reduce((sum, q) => sum + (q.likes || 0), 0)
        },
        myQuestions: history.slice(0, 10),
        loading: false
      });
    }).catch(() => {
      // 使用本地历史记录
      const history = wx.getStorageSync('history') || [];
      this.setData({
        stats: {
          totalQuestions: history.length,
          totalLikes: 0
        },
        myQuestions: history.slice(0, 10),
        loading: false
      });
    });
  },

  // 跳转到问题详情
  onQuestionTap(e) {
    const { id } = e.currentTarget.dataset;
    const question = this.data.myQuestions.find(q => q.id === id);
    
    if (question) {
      wx.navigateTo({
        url: `/pages/result/result?question=${encodeURIComponent(question.question)}&reply=${encodeURIComponent(question.reply)}&id=${id}`
      });
    }
  },

  // 跳转到历史记录
  onHistoryTap() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 跳转到首页提问
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 清除历史记录
  onClearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('history');
          this.setData({
            stats: {
              totalQuestions: 0,
              totalLikes: 0,
              guguRate: 0
            },
            myQuestions: []
          });
          wx.showToast({
            title: '已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '狗狗军师 - 无厘头AI回复',
      path: '/pages/index/index'
    };
  },

  onPullDownRefresh() {
    this.loadUserData().then(() => {
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  }
});
