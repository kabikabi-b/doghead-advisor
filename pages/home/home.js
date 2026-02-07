Page({
  data: {
    question: '',
    examples: ['老板不给涨工资', '女朋友生气了', '朋友借钱不还', '被同事穿小鞋']
  },
  onLoad() {},
  onQuestionInput(e) { this.setData({ question: e.detail.value }); },
  onExampleTap(e) { this.setData({ question: e.currentTarget.dataset.question }); },
  onGenerate() {
    if (!this.data.question.trim()) {
      wx.showToast({ title: '请输入问题', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '生成中...' });
    wx.cloud.callFunction({
      name: 'generateReply',
      data: { question: this.data.question },
      success: res => {
        wx.hideLoading();
        if (res.result.success) {
          wx.setStorageSync('lastAnswer', res.result.answer);
          wx.navigateTo({ url: '/pages/community/community' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '生成失败', icon: 'none' });
      }
    });
  }
});
