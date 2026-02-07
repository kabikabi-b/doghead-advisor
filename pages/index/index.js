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
      wx.showToast({ title: '请输入问题', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    console.log('[onGenerateTap] 开始调用云函数...');

    // 调用云函数生成回复
    wx.cloud.callFunction({
      name: 'generateReply',
      data: { question }
    }).then(res => {
      console.log('[onGenerateTap] 返回:', res);
      this.setData({ loading: false });
      
      const result = res.result || {};
      console.log('[onGenerateTap] result:', result);
      
      if (result.success === true) {
        const { reply, questionId } = result;
        console.log('[onGenerateTap] 成功! reply:', reply);
        
        // 保存到历史记录
        this.saveToHistory(question, reply);
        
        // 跳转结果页 - 使用绝对路径
        const url = '/pages/result/result?question=' + encodeURIComponent(question) + '&reply=' + encodeURIComponent(reply) + '&questionId=' + (questionId || '');
        console.log('[onGenerateTap] 跳转URL:', url);
        
        wx.navigateTo({ url: url });
      } else {
        console.log('[onGenerateTap] 失败:', result.error);
        wx.showToast({ title: result.error || '生成失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('[onGenerateTap] 异常:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '网络错误', icon: 'none' });
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
