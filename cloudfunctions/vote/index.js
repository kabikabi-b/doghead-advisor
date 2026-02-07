// 云函数: vote (点赞/取消点赞)
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { type, id } = event; // type: 'question' | 'answer'
  const wxContext = cloud.getWXContext();
  
  if (!wxContext.OPENID) {
    return { success: false, error: '未登录' };
  }
  
  if (!id) {
    return { success: false, error: '缺少 ID' };
  }
  
  try {
    // 检查是否已点赞
    const voteRecord = await db.collection('votes')
      .where({
        openid: wxContext.OPENID,
        targetId: id,
        targetType: type
      })
      .get();
    
    if (voteRecord.data.length > 0) {
      // 取消点赞
      await db.collection('votes').doc(voteRecord.data[0]._id).remove();
      
      // 更新 answers 集合的 likes 字段
      if (type === 'answer') {
        await db.collection('answers').doc(id).update({
          data: { likes: db.command.inc(-1) }
        }).catch(() => {});
      }
      
      return { success: true, action: 'unlike' };
    } else {
      // 添加点赞
      await db.collection('votes').add({
        data: {
          openid: wxContext.OPENID,
          targetId: id,
          targetType: type,
          createTime: new Date()
        }
      });
      
      // 更新 answers 集合的 likes 字段
      if (type === 'answer') {
        await db.collection('answers').doc(id).update({
          data: { likes: db.command.inc(1) }
        }).catch(() => {});
      }
      
      return { success: true, action: 'like' };
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    return { success: false, error: error.message };
  }
};
