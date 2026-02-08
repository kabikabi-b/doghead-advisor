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
        console.log('[onGenerateTap] questionId:', questionId);
        
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

  // 保存到历史记录和云数据库
  saveToHistory(question, reply) {
    const db = wx.cloud.database();
    const now = new Date();
    
    // 1. 保存到云数据库 (供社群页使用)
    db.collection('questions').add({
      data: {
        question: question,
        reply: reply,
        likes: 0,
        createTime: now.toISOString()
      }
    }).then(res => {
      console.log('[saveToHistory] 云数据库保存成功:', res._id);
    }).catch(err => {
      console.error('[saveToHistory] 云数据库保存失败:', err);
    });
    
    // 2. 保存到本地历史记录
    let history = wx.getStorageSync('history') || [];
    const newItem = {
      id: Date.now(),
      question,
      reply,
      createTime: now.toISOString()
    };
    
    // 添加到开头，保留最近50条
    history = [newItem, ...history].slice(0, 50);
    wx.setStorageSync('history', history);
    
    // 3. 同步到 users 集合统计
    this.updateUserStats(question);
  },

  // 更新用户统计
  updateUserStats(question) {
    wx.cloud.callFunction({
      name: 'getUserProfile'
    }).then(res => {
      if (res.result && res.result.userInfo) {
        const db = wx.cloud.database();
        
        // 更新用户统计
        db.collection('users').where({
          openid: res.result.userInfo.openid
        }).update({
          data: {
            totalQuestions: db.command.inc(1),
            lastQuestionTime: new Date().toISOString()
          }
        }).catch(err => {
          console.error('[updateUserStats] 更新失败:', err);
        });
      }
    }).catch(err => {
      console.error('[updateUserStats] 获取用户信息失败:', err);
    });
  },

  // 跳转到历史记录页
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  }
});
