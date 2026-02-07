Page({
  data: {
    userInfo: { avatar: '🐕', name: '卡比', id: '888888' },
    stats: { totalQuestions: 23, totalLikes: 156, guguRate: 68 },
    myQuestions: [
      { id: 1, question: '老板不给涨工资怎么办？', time: '今天 14:30', likes: 12 }
    ]
  },
  onLoad() { this.loadUserData(); },
  onShow() { this.loadUserData(); },
  loadUserData() {
    wx.cloud.callFunction({ name: 'getUserProfile', success: res => {
      if (res.result.success) this.setData({ ...res.result.data });
    }});
  },
  onQuestionTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/community/community?id=' + id });
  },
  onPullDownRefresh() { this.loadUserData(() => wx.stopPullDownRefresh()); }
});
