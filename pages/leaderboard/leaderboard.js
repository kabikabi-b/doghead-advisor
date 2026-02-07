// pages/leaderboard/leaderboard.js
Page({
  data: {
    questionList: [],
    loading: false,
    filter: 'latest',
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.loadQuestions();
  },

  onShow() {
    this.refreshData();
  },

  // 加载问题列表
  loadQuestions() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    const db = wx.cloud.database();
    const _ = db.command;

    const orderBy = this.data.filter === 'likes' ? 'likes' : 'createTime';

    db.collection('questions')
      .orderBy(orderBy, 'desc')
      .limit(20)
      .skip((this.data.page - 1) * 20)
      .get()
      .then(res => {
        const newQuestions = res.data;
        this.setData({
          questionList: [...this.data.questionList, ...newQuestions],
          page: this.data.page + 1,
          loading: false,
          hasMore: newQuestions.length === 20
        });
      })
      .catch(err => {
        console.error('加载问题失败:', err);
        this.setData({ loading: false });
      });
  },

  // 筛选
  onFilterTap(e) {
    const { filter } = e.currentTarget.dataset;
    if (filter === this.data.filter) return;

    this.setData({ 
      filter, 
      questionList: [], 
      page: 1, 
      hasMore: true 
    });
    this.loadQuestions();
  },

  // 刷新数据
  refreshData() {
    this.setData({ 
      questionList: [], 
      page: 1, 
      hasMore: true 
    });
    this.loadQuestions();
  },

  onPullDownRefresh() {
    this.setData({ 
      questionList: [], 
      page: 1, 
      hasMore: true 
    });
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
