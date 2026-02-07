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
      const mockData = [
        { id: 1, nickName: '怼神降临', avatarUrl: '', totalLikes: 1234, totalQuestions: 50, score: 1234 },
        { id: 2, nickName: '机智小狐狸', avatarUrl: '', totalLikes: 987, totalQuestions: 42, score: 987 },
        { id: 3, nickName: '快乐小狗', avatarUrl: '', totalLikes: 856, totalQuestions: 38, score: 856 },
        { id: 4, nickName: '佛系青年', avatarUrl: '', totalLikes: 654, totalQuestions: 25, score: 654 },
        { id: 5, nickName: '乐观向上', avatarUrl: '', totalLikes: 543, totalQuestions: 18, score: 543 }
      ];
      
      this.setData({ rankList: mockData });
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
