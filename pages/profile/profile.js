// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
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
    this.loadUserData();
  },

  // 微信登录
  onLoginTap() {
    wx.showLoading({ title: '登录中...' });
    
    // 获取用户头像和昵称
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('[onLoginTap] 获取用户信息成功:', res.userInfo);
        this.setData({
          userInfo: {
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
            hasUserInfo: true
          },
          hasUserInfo: true
        });
        
        // 保存到本地
        wx.setStorageSync('userInfo', res.userInfo);
        
        // 调用云函数更新用户信息
        this.updateCloudUser(res.userInfo);
        
        wx.hideLoading();
        wx.showToast({ title: '登录成功！', icon: 'success' });
      },
      fail: (err) => {
        console.error('[onLoginTap] 获取用户信息失败:', err);
        wx.hideLoading();
        
        // 尝试使用微信登录
        this.wechatLogin();
      }
    });
  },

  // 微信登录获取 OpenID
  wechatLogin() {
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      console.log('[wechatLogin] 获取用户资料:', res.result);
      if (res.result && res.result.userInfo) {
        this.setData({
          userInfo: res.result.userInfo,
          hasUserInfo: true
        });
        wx.setStorageSync('userInfo', res.result.userInfo);
      }
    }).catch(err => {
      console.error('[wechatLogin] 失败:', err);
    });
  },

  // 更新云端用户信息
  updateCloudUser(userInfo) {
    const db = wx.cloud.database();
    
    db.collection('users').where({
      openid: '{openid}' // 会被云函数自动替换
    }).get().then(res => {
      if (res.data.length > 0) {
        db.collection('users').doc(res.data[0]._id).update({
          data: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl
          }
        });
      }
    });
  },

  // 昵称输入
  onNicknameInput(e) {
    const nickName = e.detail.value;
    this.setData({
      'userInfo.nickName': nickName
    });
    wx.setStorageSync('userInfo', this.data.userInfo);
  },

  // 加载用户数据
  loadUserData() {
    this.setData({ loading: true });

    // 1. 尝试从本地获取用户信息
    const localUserInfo = wx.getStorageSync('userInfo');
    if (localUserInfo) {
      this.setData({ 
        userInfo: localUserInfo,
        hasUserInfo: true
      });
    }

    // 2. 获取用户统计数据
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      console.log('[loadUserData] getUserProfile:', res.result);
      if (res.result) {
        if (res.result.userInfo) {
          this.setData({ userInfo: res.result.userInfo });
          wx.setStorageSync('userInfo', res.result.userInfo);
        }
        if (res.result.stats) {
          this.setData({ stats: res.result.stats });
        }
      }
      this.setData({ loading: false });
    }).catch(err => {
      console.error('[loadUserData] getUserProfile 失败:', err);
      this.setData({ loading: false });
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
    this.loadUserData();
    wx.stopPullDownRefresh();
  }
});
