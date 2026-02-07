// pages/community/community.js
Page({
  data: {
    filter: 'latest',
    expandedId: null,
    questions: [
      {
        id: 1,
        avatar: '🐶',
        time: '2小时前',
        question: '老板让我周末加班还不给钱，怎么怼回去比较优雅？',
        answer: '你就说："好的老板，不过我有个小小的请求，能把我这两天的咖啡钱报销一下吗？"',
        likes: 666,
        questionVotes: 128,
        answerVotes: 256
      },
      {
        id: 2,
        avatar: '🐺',
        time: '5小时前',
        question: '相亲对象问我工资多少，怎么回答比较得体？',
        answer: '你就说："够我自己花，偶尔还能给爸妈买点小礼物。"既真诚又不暴露具体数字，妙啊！',
        likes: 520,
        questionVotes: 89,
        answerVotes: 167
      },
      {
        id: 3,
        avatar: '🦊',
        time: '1天前',
        question: '朋友借了我500块三个月了还不还，怎么提醒？',
        answer: '朋友圈发一张美食照片，配文："今天有人请客吗？不用客气，500以内我请！"',
        likes: 888,
        questionVotes: 234,
        answerVotes: 312
      }
    ]
  },
  
  onFilterTap(e) {
    this.setData({
      filter: e.currentTarget.dataset.filter
    })
  },
  
  onQuestionTap(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      expandedId: this.data.expandedId === id ? null : id
    })
  },
  
  onVote(e) {
    const { type, id } = e.currentTarget.dataset
    wx.showToast({
      title: '点赞成功！',
      icon: 'success'
    })
  }
})
