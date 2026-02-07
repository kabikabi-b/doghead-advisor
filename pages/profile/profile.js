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

    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      if (res.result && res.result.success) {
        this.setData({
          userInfo: res.result.userInfo,
          stats: res.result.stats,
          myQuestions: res.result.myQuestions,
          loading: false
        });
        // 保存到本地
        wx.setStorageSync('userInfo', res.result.userInfo);
      }
    }).catch(() => {
      // 使用微信登录信息
      wx.getUserProfile({
        desc: '用于展示用户信息',
        success: (userRes) => {
          const userInfo = {
            nickName: userRes.userInfo.nickName,
            avatarUrl: userRes.userInfo.avatarUrl,
            createTime: new Date().toLocaleString('zh-CN')
          };
          wx.setStorageSync('userInfo', userInfo);
          this.setData({
            userInfo,
            stats: { totalQuestions: 0, totalLikes: 0 },
            loading: false
          });
        },
        fail: () => {
          // 创建默认用户信息
          const defaultUser = {
            nickName: '狗狗用户',
            avatarUrl: '/images/dog-avatar/png/westie-cute.png',
            createTime: new Date().toLocaleString('zh-CN')
          };
          wx.setStorageSync('userInfo', defaultUser);
          this.setData({
            userInfo: defaultUser,
            stats: { totalQuestions: 0, totalLikes: 0 },
            loading: false
          });
        }
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
