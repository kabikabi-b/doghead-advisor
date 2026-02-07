// pages/profile/profile.js
Page({
  data: {
    myQuestions: [
      { id: 1, question: '老板不给涨工资怎么破？', time: '2024-01-15', likes: 23 },
      { id: 2, question: '女朋友又生气了怎么哄？', time: '2024-01-12', likes: 45 },
      { id: 3, question: '朋友借钱不还怎么办', time: '2024-01-10', likes: 67 },
      { id: 4, question: '被同事穿小鞋', time: '2024-01-08', likes: 34 }
    ]
  },
  
  onQuestionTap(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '查看详情',
      icon: 'none'
    })
  }
})
