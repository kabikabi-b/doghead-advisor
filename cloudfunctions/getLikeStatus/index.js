// 云函数: getLikeStatus (获取点赞状态和数量)
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { questionId } = event;
  const wxContext = cloud.getWXContext();
  
  if (!wxContext.OPENID) {
    return { success: false, error: '未登录' };
  }
  
  if (!questionId) {
    return { success: false, error: '缺少问题ID' };
  }
  
  try {
    // 检查用户是否已点赞
    const voteRecord = await db.collection('votes')
      .where({
        openid: wxContext.OPENID,
        targetId: questionId,
        targetType: 'answer'
      })
      .get();
    
    const userLiked = voteRecord.data.length > 0;
    
    // 获取点赞总数
    const answers = await db.collection('answers')
      .where({ _id: questionId })
      .get();
    
    let likeCount = 0;
    if (answers.data.length > 0) {
      likeCount = answers.data[0].likes || 0;
    }
    
    return {
      success: true,
      liked: userLiked,
      likeCount: likeCount
    };
  } catch (error) {
    console.error('获取点赞状态失败:', error);
    return { success: false, error: error.message };
  }
};
