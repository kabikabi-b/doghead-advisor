// 云函数: getLikeStatus (获取点赞状态和数量)
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { questionId } = event;
  const wxContext = cloud.getWXContext();
  
  console.log('[getLikeStatus] questionId:', questionId, 'OPENID:', wxContext.OPENID);
  
  if (!wxContext.OPENID) {
    return { success: false, error: '未登录' };
  }
  
  if (!questionId) {
    return { success: false, error: '缺少问题ID' };
  }
  
  try {
    // 1. 检查用户是否已点赞
    const voteRecord = await db.collection('votes')
      .where({
        openid: wxContext.OPENID,
        targetId: questionId,
        targetType: 'answer'
      })
      .get();
    
    const userLiked = voteRecord.data.length > 0;
    console.log('[getLikeStatus] 用户已点赞:', userLiked, '记录数:', voteRecord.data.length);
    
    // 2. 从 answers 集合获取点赞数
    let likeCount = 0;
    try {
      const answerDoc = await db.collection('answers').doc(questionId).get();
      if (answerDoc.data) {
        likeCount = answerDoc.data.likes || 0;
        console.log('[getLikeStatus] 从 answers 获取:', likeCount);
      }
    } catch (e) {
      console.log('[getLikeStatus] answers 不存在，从 votes 统计');
      // 从 votes 集合统计
      const countResult = await db.collection('votes')
        .where({
          targetId: questionId,
          targetType: 'answer'
        })
        .count();
      likeCount = countResult.total || 0;
      console.log('[getLikeStatus] 从 votes 统计总数:', likeCount);
    }
    
    return {
      success: true,
      liked: userLiked,
      likeCount: likeCount
    };
  } catch (error) {
    console.error('[getLikeStatus] 错误:', error);
    return { success: false, error: error.message };
  }
};
