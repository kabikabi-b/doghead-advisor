// pages/community/community.js
// 注意：微信小程序的 Page 函数会在运行时自动注入

Page({
  data: {
    filter: 'latest',
    questions: [],
    page: 1,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadQuestions();
  },

  onShow() {
    if (this.data.questions.length === 0) {
      this.loadQuestions();
    }
  },

  // 加载问题列表
  loadQuestions() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    const db = wx.cloud.database();
    const _ = db.command;

    db.collection('questions')
      .orderBy('createTime', this.data.filter === 'latest' ? 'desc' : 'desc')
      .limit(20)
      .skip((this.data.page - 1) * 20)
      .get()
      .then(res => {
        const newQuestions = res.data;
        this.setData({
          questions: this.data.filter === 'latest' 
            ? [...this.data.questions, ...newQuestions]
            : [...newQuestions, ...this.data.questions],
          page: this.data.page + 1,
          loading: false,
          hasMore: newQuestions.length === 20
        });
      })
      .catch(err => {
        console.error('加载问题失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
  },

  // 筛选
  onFilterTap(e) {
    const { filter } = e.currentTarget.dataset;
    if (filter === this.data.filter) return;

    this.setData({ 
      filter, 
      questions: [], 
      page: 1, 
      hasMore: true 
    });
    this.loadQuestions();
  },

  // 展开/收起答案
  onQuestionTap(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      expandedId: this.data.expandedId === id ? null : id
    });
  },

  // 点赞
  onVote(e) {
    const { type, id } = e.currentTarget.dataset;
    
    wx.cloud.callFunction({
      name: 'vote',
      data: { type, id },
      success: (res) => {
        if (res.result.success) {
          // 更新本地状态
          const questions = this.data.questions.map(q => {
            if (q._id === id) {
              return {
                ...q,
                likes: res.result.action === 'like' ? q.likes + 1 : q.likes - 1,
                voted: res.result.action === 'like'
              };
            }
            return q;
          });
          this.setData({ questions });
        }
      },
      fail: () => {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    });
  },

  onPullDownRefresh() {
    this.setData({ page: 1, questions: [], hasMore: true });
    this.loadQuestions().then(() => {
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    this.loadQuestions();
  }
});
