// pages/index/index.js
Page({
  data: {
    question: '',
    loading: false,
    sampleQuestions: [
      '今天运气怎么样？',
      '老板不给涨工资怎么办？',
      '如何追到女神？',
      '女朋友生气了怎么办？',
      '今天吃什么比较好？'
    ]
  },

  // 输入问题
  onQuestionInput(e) {
    this.setData({
      question: e.detail.value
    });
  },

  // 点击示例问题
  onSampleTap(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ question });
  },

  // 生成回复
  onGenerateTap() {
    const question = this.data.question.trim();
    
    if (!question) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    // 调用云函数生成回复
    wx.cloud.callFunction({
      name: 'generateReply',
      data: { question },
      success: (res) => {
        this.setData({ loading: false });
        
        if (res.result && res.result.success) {
          const { reply, questionId } = res.result;
          
          // 保存到历史记录
          this.saveToHistory(question, reply);
          
          // 跳转到结果页
          wx.navigateTo({
            url: `/pages/result/result?question=${encodeURIComponent(question)}&reply=${encodeURIComponent(reply)}&questionId=${questionId}`
          });
        } else {
          wx.showToast({
            title: '生成失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('调用云函数失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 保存到历史记录
  saveToHistory(question, reply) {
    let history = wx.getStorageSync('history') || [];
    const newItem = {
      id: Date.now(),
      question,
      reply,
      createTime: new Date().toLocaleString('zh-CN')
    };
    
    // 添加到开头，保留最近50条
    history = [newItem, ...history].slice(0, 50);
    wx.setStorageSync('history', history);
  },

  // 跳转到历史记录页
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  }
});
