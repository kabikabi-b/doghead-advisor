// pages/history/history.js
Page({
  data: {
    questions: []
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  // 从云数据库加载用户的提问历史
  loadHistory() {
    const db = wx.cloud.database();
    db.collection('questions')
      .orderBy('createTime', 'desc')
      .limit(50)
      .get({
        success: (res) => {
          const questions = res.data.map(item => {
            item.timeText = this.formatTime(item.createTime);
            return item;
          });
          this.setData({ questions });
        },
        fail: (err) => {
          console.error('[history] 加载失败:', err);
          // 回退到本地缓存
          const history = wx.getStorageSync('history') || [];
          this.setData({ questions: history });
        }
      });
  },

  // 点击历史记录项
  onItemTap(e) {
    const item = e.currentTarget.dataset.item;
    const id = item._id || item.id;
    wx.navigateTo({
      url: `/pages/result/result?question=${encodeURIComponent(item.question)}&reply=${encodeURIComponent(item.reply || '')}&questionId=${id}`
    });
  },

  // 返回
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: '/pages/index/index' });
      }
    });
  },

  // 去提问
  goToAsk() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + '分钟前';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + '小时前';
    const days = Math.floor(hours / 24);
    if (days < 30) return days + '天前';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return month + '月' + day + '日';
  }
});
