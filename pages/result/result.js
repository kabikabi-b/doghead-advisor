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

  // 再问一个 - 使用 redirectTo 避免返回按钮
  onAskAgainTap() {
    wx.redirectTo({
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
