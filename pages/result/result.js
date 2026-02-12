// pages/result/result.js
Page({
  data: {
    question: '',
    reply: '',
    questionId: '',
    isLiked: false,
    likeCount: 0,
    commentCount: 0,
    viewCount: 0,
    formatTimeText: '',
    showToast: false,
    toastText: ''
  },

  onLoad(options) {
    console.log('[result] onLoad options:', JSON.stringify(options));
    
    if (options.question && options.reply) {
      // 过滤 think 标签
      let reply = decodeURIComponent(options.reply);
      reply = reply.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      reply = reply.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
      reply = reply.replace(/<reflexion>[\s\S]*?<\/reflexion>/gi, '');
      reply = reply.replace(/<｜think｜>[\s\S]*?<｜think｜>/gi, '');
      reply = reply.replace(/<｜/g, '').replace(/｜>/g, '');
      reply = reply.replace(/&lt;｜/g, '<').replace(/｜&gt;/g, '>');
      reply = reply.trim();

      this.setData({
        question: decodeURIComponent(options.question),
        reply: reply,
        questionId: options.questionId || '',
        formatTimeText: this.formatTime(new Date())
      });
    } else if (options.questionId) {
      // 从详情页进入，通过ID加载
      this.loadQuestionById(options.questionId);
    }
    // 加载点赞数据
    this.loadLikeData();
  },

  // 通过ID加载问题详情
  loadQuestionById(questionId) {
    const db = wx.cloud.database();
    db.collection('questions').doc(questionId).get({
      success: (res) => {
        const data = res.data;
        let reply = data.reply || '';
        reply = reply.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
        reply = reply.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
        reply = reply.trim();

        this.setData({
          question: data.question || '',
          reply: reply,
          questionId: questionId,
          likeCount: data.likes || 0,
          viewCount: data.views || 0,
          formatTimeText: this.formatTime(data.createTime)
        });
      },
      fail: (err) => {
        console.error('[loadQuestion] 加载失败:', err);
      }
    });
  },

  // 加载点赞数据和状态
  loadLikeData() {
    const { questionId } = this.data;
    if (!questionId) return;

    wx.cloud.callFunction({
      name: 'getLikeStatus',
      data: { questionId },
      success: (res) => {
        if (res.result && res.result.success) {
          this.setData({
            isLiked: res.result.liked,
            likeCount: res.result.likeCount || 0
          });
        }
      },
      fail: (err) => {
        console.error('[getLikeStatus] 获取失败:', err);
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({ url: '/pages/index/index' });
      }
    });
  },

  // 点赞
  handleLike() {
    // 检查是否登录
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

    const { questionId, isLiked } = this.data;
    if (!questionId) {
      this.showToast('无法点赞');
      return;
    }

    // 乐观更新UI
    const newLiked = !isLiked;
    const newCount = isLiked ? this.data.likeCount - 1 : this.data.likeCount + 1;
    this.setData({ isLiked: newLiked, likeCount: newCount });

    wx.cloud.callFunction({
      name: 'vote',
      data: { type: 'question', id: questionId },
      success: (res) => {
        if (res.result && !res.result.success) {
          // 失败恢复
          this.setData({ isLiked: isLiked, likeCount: this.data.likeCount + (isLiked ? 1 : -1) });
          this.showToast('点赞失败');
        } else {
          const action = res.result.action;
          this.showToast(action === 'like' ? '点赞成功！🐕' : '已取消点赞');
        }
      },
      fail: () => {
        this.setData({ isLiked: isLiked, likeCount: this.data.likeCount + (isLiked ? 1 : -1) });
        this.showToast('网络错误');
      }
    });
  },

  // 评论（占位）
  handleComment() {
    this.showToast('评论功能即将上线');
  },

  // 分享
  handleShare() {
    // 微信小程序分享通过 onShareAppMessage 实现
    this.showToast('请点击右上角分享');
  },

  onShareAppMessage() {
    return {
      title: this.data.question,
      path: `/pages/result/result?questionId=${this.data.questionId}`
    };
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + '分钟前';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + '小时前';
    const days = Math.floor(hours / 24);
    if (days < 30) return days + '天前';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return month + '月' + day + '日';
  },

  // 格式化数字
  formatNumber(num) {
    if (!num) return '0';
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return String(num);
  },

  // 显示 Toast
  showToast(text) {
    this.setData({ toastText: text, showToast: true });
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  }
});
