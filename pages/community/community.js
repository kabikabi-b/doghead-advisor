// pages/community/community.js

const dbInit = require('../../utils/db-init.js');

Page({
  data: {
    sortBy: 'hot',
    questions: [],
    page: 1,
    loading: false,
    hasMore: true,
    collectionError: false,
    collectionNotReady: '',
    tabStickyTop: 0
  },

  onLoad() {
    // 标签栏 sticky 时停在胶囊按钮底部下方
    const menuBtn = wx.getMenuButtonBoundingClientRect();
    this.setData({ tabStickyTop: menuBtn.bottom + 4 });

    this.checkDatabase().then(isReady => {
      if (isReady) {
        this.loadQuestions();
      }
    });
  },

  onShow() {
    if (this.data.collectionError) return;
    // 刷新数据
    this.setData({ page: 1, questions: [], hasMore: true });
    this.loadQuestions();
  },

  // 检查数据库集合是否就绪
  async checkDatabase() {
    try {
      const results = await dbInit.checkCollections();
      const notReady = dbInit.getNotReadyCollections(results);
      if (notReady.length > 0) {
        this.setData({
          collectionError: true,
          collectionNotReady: notReady.join(', ')
        });
        return false;
      }
      this.setData({ collectionError: false, collectionNotReady: '' });
      return true;
    } catch (error) {
      console.error('[community] 检查数据库失败:', error);
      this.setData({ collectionError: true });
      return false;
    }
  },

  // 初始化数据库集合
  async initDatabase() {
    wx.showLoading({ title: '初始化中...' });
    try {
      const results = await dbInit.initDatabase();
      const notReady = dbInit.getNotReadyCollections(results);
      wx.hideLoading();
      if (notReady.length === 0) {
        this.setData({ collectionError: false, collectionNotReady: '' });
        wx.showToast({ title: '初始化成功!', icon: 'success' });
        this.loadQuestions();
      } else {
        this.setData({
          collectionError: true,
          collectionNotReady: notReady.join(', ')
        });
        wx.showModal({
          title: '部分集合初始化失败',
          content: '以下集合仍有问题: ' + notReady.join(', '),
          showCancel: false
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('[community] 初始化数据库失败:', error);
      wx.showToast({ title: '初始化失败', icon: 'none' });
    }
  },

  // 切换标签
  switchTab(e) {
    const sortBy = e.currentTarget.dataset.sort;
    if (sortBy === this.data.sortBy) return;
    this.setData({ sortBy, questions: [], page: 1, hasMore: true });
    this.loadQuestions();
  },

  // 加载问题列表
  loadQuestions() {
    if (this.data.collectionError) return;
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    const db = wx.cloud.database();
    const orderField = this.data.sortBy === 'hot' ? 'likes' : 'createTime';

    db.collection('questions')
      .orderBy(orderField, 'desc')
      .limit(20)
      .skip((this.data.page - 1) * 20)
      .get()
      .then(res => {
        const newQuestions = res.data.map(item => {
          item._relativeTime = this.formatTime(item.createTime);
          item._likesText = this.formatNumber(item.likes || 0);
          item._viewsText = this.formatNumber(item.views || 0);
          item._commentsText = this.formatNumber(item.comments || 0);
          item._liked = false; // 后续可加载用户点赞状态
          return item;
        });

        this.setData({
          questions: [...this.data.questions, ...newQuestions],
          page: this.data.page + 1,
          loading: false,
          hasMore: newQuestions.length === 20
        });
      })
      .catch(err => {
        console.error('[community] 加载问题失败:', err);
        this.setData({ loading: false });
        if (err.errMsg && err.errMsg.includes('collection not exists')) {
          this.setData({ questions: [], hasMore: false, collectionError: true });
        } else {
          wx.showToast({ title: '加载失败，请重试', icon: 'none' });
        }
      });
  },

  // 点击卡片跳转到结果页
  handleCardClick(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    const url = '/pages/result/result?question=' + encodeURIComponent(item.question) +
                '&reply=' + encodeURIComponent(item.reply || '') +
                '&questionId=' + (item._id || '');
    wx.navigateTo({ url });
  },

  // 点赞
  handleLike(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    // 检查登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.nickName) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再点赞',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/profile/profile' });
          }
        }
      });
      return;
    }

    // 乐观更新UI
    const questions = this.data.questions.map(q => {
      if (q._id === id) {
        const newLiked = !q._liked;
        const newLikes = newLiked ? (q.likes || 0) + 1 : (q.likes || 0) - 1;
        return {
          ...q,
          _liked: newLiked,
          likes: newLikes,
          _likesText: this.formatNumber(newLikes)
        };
      }
      return q;
    });
    this.setData({ questions });

    wx.cloud.callFunction({
      name: 'vote',
      data: { type: 'question', id }
    }).then(res => {
      if (res.result && !res.result.success) {
        // 失败回滚
        this.setData({ page: 1, questions: [], hasMore: true });
        this.loadQuestions();
      } else {
        wx.showToast({
          title: res.result.action === 'like' ? '点赞成功' : '已取消',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('[community] 点赞失败:', err);
      this.setData({ page: 1, questions: [], hasMore: true });
      this.loadQuestions();
      wx.showToast({ title: '点赞失败', icon: 'none' });
    });
  },

  // 格式化相对时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    const now = new Date();
    const time = new Date(timeStr);
    const diff = (now - time) / 1000; // 秒

    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 2592000) return Math.floor(diff / 86400) + '天前';
    if (diff < 31536000) return Math.floor(diff / 2592000) + '个月前';
    return Math.floor(diff / 31536000) + '年前';
  },

  // 格式化数字 (1k, 1w)
  formatNumber(num) {
    if (!num && num !== 0) return '0';
    num = Number(num);
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return String(num);
  },

  onPullDownRefresh() {
    this.setData({ page: 1, questions: [], hasMore: true });
    this.loadQuestions();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    this.loadQuestions();
  }
});
