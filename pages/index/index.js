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
    console.log('[onGenerateTap] question:', question);
    
    if (!question) {
      wx.showToast({ title: '请输入问题', icon: 'none' });
      return;
    }

    console.log('[onGenerateTap] 开始调用云函数...');
    this.setData({ loading: true });

    // 调用云函数生成回复
    wx.cloud.callFunction({
      name: 'generateReply',
      data: { question }
    }).then(res => {
      console.log('[onGenerateTap] 云函数返回完整:', JSON.stringify(res, null, 2));
      this.setData({ loading: false });
      
      // 兼容不同的返回格式
      const resultData = res.result || res.data || res;
      console.log('[onGenerateTap] resultData:', JSON.stringify(resultData));
      
      if (resultData && (resultData.success === true || resultData.code === 0)) {
        const { reply, questionId } = resultData;
        console.log('[onGenerateTap] 成功! reply:', reply);
        
        // 保存到历史记录
        this.saveToHistory(question, reply);
        
        // 跳转结果页
        wx.navigateTo({
          url: `/pages/result/result?question=${encodeURIComponent(question)}&reply=${encodeURIComponent(reply)}&questionId=${questionId || ''}`
        });
      } else {
        console.log('[onGenerateTap] 失败:', resultData);
        wx.showToast({ title: resultData?.error || '生成失败', icon: 'none' });
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
