Page({
  data: {
    filter: 'latest',
    questions: [
      { id: 1, avatar: '🐕', name: '匿名汪汪队', time: '2分钟前', likes: 128, question: '今天老板又PUA我了...', answer: '你就说：老板，我效率低还不是因为您太优秀了！' }
    ],
    expandedId: null
  },
  onLoad() { this.loadQuestions(); },
  onShow() { this.loadQuestions(); },
  loadQuestions() {
    wx.cloud.callFunction({ name: 'getQuestions', data: { filter: this.data.filter }, success: res => {
      if (res.result.success) this.setData({ questions: res.result.data });
    }});
  },
  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ filter });
    this.loadQuestions();
  },
  onQuestionTap(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ expandedId: this.data.expandedId === id ? null : id });
  },
  onVote(e) {
    const { type, id } = e.currentTarget.dataset;
    wx.cloud.callFunction({ name: 'vote', data: { type, id }, success: () => this.loadQuestions() });
  },
  onPullDownRefresh() { this.loadQuestions(() => wx.stopPullDownRefresh()); },
  onReachBottom() { this.loadQuestions(); }
});
