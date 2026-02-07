// pages/home/home.js
Page({
  data: {
    question: ''
  },
  
  onQuestionInput(e) {
    this.setData({
      question: e.detail.value
    })
  },
  
  onExampleTap(e) {
    const question = e.currentTarget.dataset.question
    this.setData({ question })
    this.onGenerate()
  },
  
  onGenerate() {
    const { question } = this.data
    if (!question.trim()) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({ title: '思考中...' })
    
    // 调用云函数生成回复
    wx.cloud.callFunction({
      name: 'generateReply',
      data: { question }
    }).then(res => {
      wx.hideLoading()
      if (res.result.success) {
        wx.showModal({
          title: '🎯 狗狗军师回复',
          content: res.result.answer,
          showCancel: false
        })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      })
    })
  }
})
