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
    
    const questionsCount = await db.collection('questions').count();
    
    const userRes = await db.collection('users').where({ openid }).get();
    
    return {
      success: true,
      data: {
        totalQuestions: questionsCount.total,
        userInfo: userRes.data[0] || null
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
