// 云函数: getUserProfile (获取用户资料)
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  if (!wxContext.OPENID) {
    return { success: false, error: '未登录' };
  }
  
  try {
    // 获取或创建用户
    let user = await db.collection('users')
      .where({ openid: wxContext.OPENID })
      .get();
    
    if (user.data.length === 0) {
      // 创建新用户
      await db.collection('users').add({
        data: {
          openid: wxContext.OPENID,
          nickName: '新用户',
          avatarUrl: '🐕',
          createTime: new Date()
        }
      });
      user = await db.collection('users').where({ openid: wxContext.OPENID }).get();
    }
    
    const currentUser = user.data[0];
    
    // 获取用户的所有问题用于计算统计
    const allQuestions = await db.collection('questions')
      .where({ openid: wxContext.OPENID })
      .get();
    
    // 计算统计数据
    const totalQuestions = allQuestions.data.length;
    const totalLikes = allQuestions.data.reduce((sum, q) => sum + (q.likes || 0), 0);
    
    return {
      success: true,
      userInfo: {
        _id: currentUser._id,
        nickName: currentUser.nickName || '新用户',
        avatarUrl: currentUser.avatarUrl || '🐕',
        createTime: currentUser.createTime?.toLocaleString('zh-CN') || new Date().toLocaleString('zh-CN')
      },
      stats: {
        totalQuestions: totalQuestions,
        totalLikes: totalLikes
      },
      myQuestions: allQuestions.data
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .slice(0, 20)
        .map(q => ({
          id: q._id,
          question: q.question,
          reply: q.reply,
          createTime: q.createTime?.toLocaleString('zh-CN') || '',
          likes: q.likes || 0
        }))
    };
  } catch (error) {
    console.error('获取用户资料失败:', error);
    
    // 从本地存储获取备用数据
    const history = wx.getStorageSync('history') || [];
    return {
      success: true,
      userInfo: {
        nickName: '新用户',
        avatarUrl: '🐕',
        createTime: new Date().toLocaleString('zh-CN')
      },
      stats: {
        totalQuestions: history.length,
        totalLikes: 0
      },
      myQuestions: history
    };
  }
};
