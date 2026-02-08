// 云函数: vote (点赞/取消点赞)
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { type, id, testOpenid, INTERNAL_TEST_TOKEN } = event;
  const wxContext = cloud.getWXContext();

  // DEV ONLY: 测试旁路 - 如果 INTERNAL_TEST_TOKEN 匹配，使用 testOpenid
  let openid = wxContext.OPENID;
  const DEV_TOKEN = process.env.INTERNAL_TEST_TOKEN || 'DEV_TEST_123';
  
  if (INTERNAL_TEST_TOKEN === DEV_TOKEN && testOpenid) {
    console.log('[vote] 🧪 DEV MODE: 使用测试 OpenID');
    openid = testOpenid;
  }

  console.log('[vote] type:', type, 'id:', id, 'OPENID:', openid);

  if (!openid) {
    return { success: false, error: '未登录' };
  }

  if (!id) {
    return { success: false, error: '缺少 ID' };
  }

  try {
    // 检查是否已点赞
    const voteRecord = await db.collection('votes')
      .where({
        openid: openid,
        targetId: id,
        targetType: type
      })
      .get();

    console.log('[vote] 已有点赞记录:', voteRecord.data.length > 0);

    // 确定要更新的集合: type 为 'question' 时更新 questions，为 'answer' 时更新 answers
    const targetCollection = type === 'answer' ? 'answers' : 'questions';
    console.log('[vote] 目标集合:', targetCollection);

    // 获取目标问题/答案的创建者
    const targetDoc = await db.collection(targetCollection).doc(id).get();
    if (!targetDoc.data) {
      console.log('[vote] 目标不存在');
      return { success: false, error: '目标不存在' };
    }
    const targetCreatorOpenid = targetDoc.data.openid;
    console.log('[vote] 目标创建者 openid:', targetCreatorOpenid);

    if (voteRecord.data.length > 0) {
      // 取消点赞
      await db.collection('votes').doc(voteRecord.data[0]._id).remove();
      console.log('[vote] 已删除 votes 记录');

      // 更新目标集合的 likes 字段
      await db.collection(targetCollection).doc(id).update({
        data: { likes: db.command.inc(-1) }
      }).then(() => console.log(`[vote] ${targetCollection}.likes -1`))
        .catch(e => console.log(`[vote] ${targetCollection} 更新失败:`, e.message));

      // 更新创建者的 totalLikes 统计
      if (targetCreatorOpenid) {
        await db.collection('users').where({ openid: targetCreatorOpenid }).update({
          data: {
            'stats.totalLikes': db.command.inc(-1)
          }
        }).then(() => console.log('[vote] users.stats.totalLikes -1'))
          .catch(e => console.log('[vote] users 更新失败:', e.message));
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

      // 更新目标集合的 likes 字段
      await db.collection(targetCollection).doc(id).update({
        data: { likes: db.command.inc(1) }
      }).then(() => console.log(`[vote] ${targetCollection}.likes +1`))
        .catch(e => console.log(`[vote] ${targetCollection} 更新失败:`, e.message));

      // 更新创建者的 totalLikes 统计
      if (targetCreatorOpenid) {
        await db.collection('users').where({ openid: targetCreatorOpenid }).update({
          data: {
            'stats.totalLikes': db.command.inc(1)
          }
        }).then(() => console.log('[vote] users.stats.totalLikes +1'))
          .catch(e => console.log('[vote] users 更新失败:', e.message));
      }

      return { success: true, action: 'like' };
    }
  } catch (error) {
    console.error('[vote] 错误:', error);
    return { success: false, error: error.message };
  }
};
