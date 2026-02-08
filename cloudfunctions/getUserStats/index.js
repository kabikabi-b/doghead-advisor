const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    
    if (!openid) {
      return { success: false, error: '未登录' };
    }
    
    console.log('[getUserStats] openid:', openid.substring(0, 10));
    
    // 使用 where + count 替代单独的 count
    const questionsCount = await db.collection('questions')
      .where({ openid })
      .count();
    
    console.log('[getUserStats] 问题数:', questionsCount.total);
    
    const userRes = await db.collection('users').where({ openid }).get();
    console.log('[getUserStats] 用户数据:', userRes.data.length > 0);
    
    return {
      success: true,
      data: {
        totalQuestions: questionsCount.total,
        userInfo: userRes.data[0] || null
      }
    };
  } catch (error) {
    console.log('[getUserStats] 错误:', error.message);
    return { success: false, error: error.message };
  }
};
