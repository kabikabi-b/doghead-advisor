const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const questions = await db.collection('questions')
      .where({ likes: db.command.exists(false) })
      .get();
    
    console.log('找到 ' + questions.data.length + ' 个需要修复的问题');
    
    for (const q of questions.data) {
      await db.collection('questions').doc(q._id).update({
        data: { likes: 0, votedUserList: [] }
      });
    }
    
    return { success: true, fixedCount: questions.data.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
