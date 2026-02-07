// 云函数: vote (点赞/取消点赞)
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { type, id } = event;
  const wxContext = cloud.getWXContext();
  
  console.log('[vote] type:', type, 'id:', id, 'OPENID:', wxContext.OPENID);
  
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
    
    console.log('[vote] 已有点赞记录:', voteRecord.data.length > 0);
    
    if (voteRecord.data.length > 0) {
      // 取消点赞
      await db.collection('votes').doc(voteRecord.data[0]._id).remove();
      console.log('[vote] 已删除 votes 记录');
      
      // 更新 answers 集合的 likes 字段
      if (type === 'answer') {
        await db.collection('answers').doc(id).update({
          data: { likes: db.command.inc(-1) }
        }).then(() => console.log('[vote] answers.likes -1'))
          .catch(e => console.log('[vote] answers 更新失败:', e.message));
      }
      
      return { success: true, action: 'unlike' };
    } else {
      // 添加点赞
      const voteResult = await db.collection('votes').add({
        data: {
          openid: wxContext.OPENID,
          targetId: id,
          targetType: type,
          createTime: new Date()
        }
      });
      console.log('[vote] 已添加 votes 记录, _id:', voteResult.id);
      
      // 更新 answers 集合的 likes 字段
      if (type === 'answer') {
        await db.collection('answers').doc(id).update({
          data: { likes: db.command.inc(1) }
        }).then(() => console.log('[vote] answers.likes +1'))
          .catch(e => console.log('[vote] answers 更新失败:', e.message));
      }
      
      return { success: true, action: 'like' };
    }
  } catch (error) {
    console.error('[vote] 错误:', error);
    return { success: false, error: error.message };
  }
};
