// pages/community/community.js

const db = require('../../utils/db-init.js');

Page({
  data: {
    filter: 'latest',
    questions: [],
    page: 1,
    loading: false,
    hasMore: true,
    collectionError: false,
    collectionNotReady: []
  },

  onLoad() {
    // 先检查数据库
    this.checkDatabase().then(isReady => {
      if (isReady) {
        this.loadQuestions();
      }
    });
  },

  onShow() {
    // 如果数据库有问题，不加载
    if (this.data.collectionError) {
      return;
    }
    
    // 如果数据库就绪且没有数据，才加载
    if (this.data.questions.length === 0) {
      this.loadQuestions();
    }
  },

  /**
   * 检查数据库集合是否就绪
   */
  async checkDatabase() {
    console.log('[checkDatabase] 开始检查数据库');
    try {
      const results = await db.checkCollections();
      console.log('[checkDatabase] 检查结果:', results);
      const notReady = db.getNotReadyCollections(results);
      
      if (notReady.length > 0) {
        this.setData({ 
          collectionError: true,
          collectionNotReady: notReady
        });
        return false;
      }
      
      this.setData({ 
        collectionError: false,
        collectionNotReady: []
      });
      return true;
    } catch (error) {
      console.error('检查数据库失败:', error);
      this.setData({ collectionError: true });
      return false;
    }
  },

  /**
   * 初始化数据库集合
   */
  async initDatabase() {
    console.log('[initDatabase] 被调用');
    wx.showLoading({ title: '初始化中...' });
    
    try {
      const results = await db.initDatabase();
      const notReady = db.getNotReadyCollections(results);
      
      wx.hideLoading();
      
      if (notReady.length === 0) {
        this.setData({ 
          collectionError: false,
          collectionNotReady: []
        });
        wx.showToast({ title: '初始化成功!', icon: 'success' });
        // 重新加载数据
        this.loadQuestions();
      } else {
        this.setData({ 
          collectionError: true,
          collectionNotReady: notReady
        });
        wx.showModal({
          title: '部分集合初始化失败',
          content: `以下集合仍有问题: ${notReady.join(', ')}`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('初始化数据库失败:', error);
      wx.showToast({
        title: '初始化失败',
        icon: 'none'
      });
    }
  },

  // 加载问题列表
  loadQuestions() {
    // 如果数据库有问题，不加载
    if (this.data.collectionError) {
      console.log('[loadQuestions] 数据库有问题，跳过加载');
      return;
    }
    
    if (this.data.loading || !this.data.hasMore) return;

    console.log('[loadQuestions] 开始加载问题');
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
        console.error('[loadQuestions] 加载问题失败:', err);
        this.setData({ loading: false });
        
        // 检查是否是集合不存在的错误
        if (err.errMsg && err.errMsg.includes('collection not exists')) {
          // 显示空状态和提示
          this.setData({ 
            questions: [],
            hasMore: false,
            collectionError: true 
          });
        } else {
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'none'
          });
        }
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
