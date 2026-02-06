// pages/history/history.js
Page({
  data: {
    history: []
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory() {
    const history = wx.getStorageSync('history') || [];
    this.setData({ history });
  },

  // 点击历史记录项
  onItemTap(e) {
    const item = e.currentTarget.dataset.item;
    
    // 跳转到结果页
    wx.navigateTo({
      url: `/pages/result/result?question=${encodeURIComponent(item.question)}&reply=${encodeURIComponent(item.reply)}&questionId=${item.id}`
    });
  },

  // 去提问
  goToAsk() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});
