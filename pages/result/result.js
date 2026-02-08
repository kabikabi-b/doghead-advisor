// pages/result/result.js
Page({
  data: {
    question: '',
    reply: '',
    questionId: '',
    liked: false,
    likeCount: 0,
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
      
      console.log('[result] questionId from URL:', options.questionId);
      
      this.setData({
        question: decodeURIComponent(options.question),
        reply: reply,
        questionId: options.questionId || ''
      });
    }
    
    console.log('[result] this.data.questionId:', this.data.questionId);
    
    // 加载点赞数据
    this.loadLikeData();
  },

  // 加载点赞数据和状态
  loadLikeData() {
    const { questionId } = this.data;
    if (!questionId) return;
    
    console.log('[getLikeStatus] 正在获取点赞状态, questionId:', questionId);
    
    // 获取用户点赞状态
    wx.cloud.callFunction({
      name: 'getLikeStatus',
      data: { questionId },
      success: (res) => {
        console.log('[getLikeStatus] 成功:', res.result);
        if (res.result && res.result.success) {
          this.setData({
            liked: res.result.liked,
            likeCount: res.result.likeCount || 0
          });
          console.log('[getLikeStatus] 更新状态: liked=' + res.result.liked + ', likeCount=' + res.result.likeCount);
        } else {
          console.error('[getLikeStatus] 返回失败:', res.result);
        }
      },
      fail: (err) => {
        console.error('[getLikeStatus] 获取失败:', err);
      }
    });
  },

  // 返回上一页
  onBackTap() {
    wx.navigateBack({
      fail: () => {
        // 如果没有上一页，直接跳转到首页
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  },

  // 复制回复
  onCopyTap(e) {
    const content = e.currentTarget.dataset.content;
    
    wx.setClipboardData({
      data: content,
      success: () => {
        this.showToast('已复制到剪贴板');
      },
      fail: () => {
        this.showToast('复制失败，请手动复制');
      }
    });
  },

  // 点赞
  onLikeTap() {
    // 检查是否登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.nickName) {
      console.log('[vote] 用户未登录');
      wx.showModal({
        title: '提示',
        content: '请先登录后再点赞',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            // 跳转到个人页（登录入口在个人页）
            wx.switchTab({
              url: '/pages/profile/profile'
            });
          }
        }
      });
      return;
    }
    
    const { questionId, liked } = this.data;
    if (!questionId) {
      console.error('[vote] 缺少 questionId');
      this.showToast('无法点赞');
      return;
    }
    
    console.log('[vote] 触发点赞, 当前 liked=' + liked + ', questionId=' + questionId);
    
    // 先更新UI
    const newLiked = !liked;
    const newCount = liked ? this.data.likeCount - 1 : this.data.likeCount + 1;
    
    this.setData({
      liked: newLiked,
      likeCount: newCount
    });
    
    console.log('[vote] 乐观更新 UI: liked=' + newLiked + ', likeCount=' + newCount);
    
    // 调用云函数
    wx.cloud.callFunction({
      name: 'vote',
      data: { type: 'question', id: questionId },
      success: (res) => {
        console.log('[vote] 云函数返回:', res.result);
        if (res.result && !res.result.success) {
          // 失败了，恢复原状
          this.setData({
            liked: liked,
            likeCount: liked ? this.data.likeCount + 1 : this.data.likeCount - 1
          });
          this.showToast('点赞失败');
        } else {
          const action = res.result.action;
          this.showToast(action === 'like' ? '点赞成功！🐕' : '已取消点赞');
        }
      },
      fail: (err) => {
        // 失败了，恢复原状
        this.setData({
          liked: liked,
          likeCount: liked ? this.data.likeCount + 1 : this.data.likeCount - 1
        });
        console.error('[vote] 网络错误:', err);
        this.showToast('网络错误');
      }
    });
  },

  // 再问一个
  onAskAgainTap() {
    // 跳转到首页（带清空状态）
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 显示 Toast
  showToast(text) {
    this.setData({
      toastText: text,
      showToast: true
    });

    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  }
});
