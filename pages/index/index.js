// pages/index/index.js
const LOADING_MESSAGES = [
  '军师正在掐指一算...',
  '狗头CPU全速运转中...',
  '正在翻阅《狗头宝典》...',
  '军师正在摇头晃脑思考...',
  '正在召唤狗头智慧...',
  '军师的尾巴正在疯狂摇摆...',
  '正在查阅《论如何给人类出馊主意》...'
];

Page({
  data: {
    question: '',
    answer: '',
    isLoading: false,
    showAnswer: false,
    hotQuestions: [],
    loadingMessage: '',
    charCount: 0
  },

  _loadingTimer: null,

  onLoad() {
    this.loadHotQuestions();
  },

  onShow() {
    // 刷新热门问题
  },

  // 加载热门问题
  loadHotQuestions() {
    const db = wx.cloud.database();
    db.collection('questions')
      .orderBy('likes', 'desc')
      .limit(5)
      .get()
      .then(res => {
        const hotQuestions = res.data.map(item => ({
          id: item._id,
          question: item.question,
          likes: item.likes || 0
        }));
        this.setData({ hotQuestions });
      })
      .catch(err => {
        console.error('[loadHotQuestions] 失败:', err);
      });
  },

  // 输入处理
  handleInput(e) {
    const value = e.detail.value;
    this.setData({
      question: value,
      charCount: value.length
    });
  },

  // 提问
  handleAskQuestion() {
    const question = this.data.question.trim();
    if (!question) {
      wx.showToast({ title: '请输入问题', icon: 'none' });
      return;
    }

    this.setData({ isLoading: true });
    this._startLoadingMessages();

    wx.cloud.callFunction({
      name: 'generateReply',
      data: { question }
    }).then(res => {
      this._stopLoadingMessages();
      const result = res.result || {};

      if (result.success === true) {
        this.setData({
          isLoading: false,
          showAnswer: true,
          answer: result.reply
        });
      } else {
        this.setData({ isLoading: false });
        wx.showToast({ title: result.error || '生成失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('[handleAskQuestion] 异常:', err);
      this._stopLoadingMessages();
      this.setData({ isLoading: false });
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  },

  // 重新提问
  handleReset() {
    this.setData({
      question: '',
      answer: '',
      showAnswer: false,
      charCount: 0
    });
  },

  // 分享到广场
  handleShareToSquare() {
    wx.showToast({ title: '已分享到广场', icon: 'success' });
  },

  // 快速提问（点击热门问题）
  handleQuickAsk(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ question, charCount: question.length });
    this.handleAskQuestion();
  },

  // 开始轮播加载消息
  _startLoadingMessages() {
    let index = 0;
    this.setData({ loadingMessage: LOADING_MESSAGES[0] });
    this._loadingTimer = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      this.setData({ loadingMessage: LOADING_MESSAGES[index] });
    }, 2000);
  },

  // 停止轮播
  _stopLoadingMessages() {
    if (this._loadingTimer) {
      clearInterval(this._loadingTimer);
      this._loadingTimer = null;
    }
  }
});
