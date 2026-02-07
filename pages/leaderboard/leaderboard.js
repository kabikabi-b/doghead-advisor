Page({
  data: {
    filter: 'likes',
    rankList: [
      { id: 1, avatar: '🦁', name: '怼神降临', likes: 1234, guguRate: 99, score: 1234 },
      { id: 2, avatar: '🐯', name: '机智小狐狸', likes: 987, guguRate: 85, score: 987 }
    ],
    currentUserRank: { rank: 5, score: 543 }
  },
  onLoad() { this.loadRankList(); },
  onShow() { this.loadRankList(); },
  loadRankList() {
    wx.cloud.callFunction({ name: 'getLeaderboard', data: { filter: this.data.filter }, success: res => {
      if (res.result.success) this.setData({ rankList: res.result.data });
    }});
  },
  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ filter });
    this.loadRankList();
  },
  onUserTap() { wx.showToast({ title: '功能开发中', icon: 'none' }); },
  onPullDownRefresh() { this.loadRankList(() => wx.stopPullDownRefresh()); }
});
