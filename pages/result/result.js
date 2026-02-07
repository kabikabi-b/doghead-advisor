// pages/result/result.js
Page({
  data: {
    question: '',
    reply: '',
    questionId: '',
    liked: false,
    showToast: false,
    toastText: ''
  },

  onLoad(options) {
    if (options.question && options.reply) {
      this.setData({
        question: decodeURIComponent(options.question),
        reply: decodeURIComponent(options.reply),
        questionId: options.questionId || ''
      });
    }
  },

  // 返回上一页
  onBackTap() {
    wx.navigateBack({
      fail: () => {
        // 如果没有上一页，直接跳转到首页
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  },

  // 复制回复
  onCopyTap(e) {
    const content = e.currentTarget.dataset.content;
    
    wx.setClipboardData({
      data: content,
      success: () => {
        this.showToast('已复制到剪贴板');
      },
      fail: () => {
        this.showToast('复制失败，请手动复制');
      }
    });
  },

  // 点赞
  onLikeTap() {
    this.setData({
      liked: !this.data.liked
    });
    
    if (this.data.liked) {
      this.showToast('感谢点赞！🙏');
    }
  },

  // 再问一个
  onAskAgainTap() {
    // 跳转到首页（带清空状态）
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 显示 Toast
  showToast(text) {
    this.setData({
      toastText: text,
      showToast: true
    });

    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  }
});
