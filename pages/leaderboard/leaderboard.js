// pages/leaderboard/leaderboard.js
Page({
  data: {
    rankList: [],
    currentUserRank: null,
    filter: 'likes',
    currentUser: null
  },

  onLoad() {
    this.loadRankList();
    this.getCurrentUser();
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
      if (res.result && res.result.success) {
        this.setData({
          rankList: res.result.list,
          currentUserRank: res.result.currentUserRank
        });
      }
    }).catch(err => {
      console.error('加载排行榜失败:', err);
      // 使用模拟数据
      this.setData({
        rankList: [
          { id: 1, name: '怼神降临', avatar: '🦁', likes: 1234, guguRate: 99, score: 1234 },
          { id: 2, name: '机智小狐狸', avatar: '🦊', likes: 987, guguRate: 85, score: 987 },
          { id: 3, name: '快乐小狗', avatar: '🐕', likes: 856, guguRate: 72, score: 856 },
          { id: 4, name: '佛系青年', avatar: '🧘', likes: 654, guguRate: 60, score: 654 },
          { id: 5, name: '乐观向上', avatar: '🌟', likes: 543, guguRate: 45, score: 543 }
        ]
      });
    });
  },

  // 获取当前用户
  getCurrentUser() {
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      if (res.result && res.result.userInfo) {
        this.setData({ currentUser: res.result.userInfo });
      }
    }).catch(() => {
      // 使用本地存储的用户
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ currentUser: userInfo });
      }
    });
  },

  // 筛选
  onFilterTap(e) {
    const { filter } = e.currentTarget.dataset;
    if (filter === this.data.filter) return;
    
    this.setData({ filter });
    this.loadRankList();
  },

  // 刷新数据
  refreshData() {
    this.loadRankList();
  },

  // 查看用户详情
  onUserTap(e) {
    const { userId } = e.currentTarget.dataset;
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  onPullDownRefresh() {
    this.loadRankList().then(() => {
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  }
});
