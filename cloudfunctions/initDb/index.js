/**
 * 数据库集合初始化云函数
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { action } = event;
  
  if (action === 'check') {
    // 检查集合是否存在
    const collections = ['questions', 'votes', 'users'];
    const results = [];
    
    for (const name of collections) {
      try {
        await db.collection(name).count();
        results.push({ name, exists: true });
      } catch (e) {
        results.push({ name, exists: false });
      }
    }
    
    return {
      code: 0,
      message: '检查完成',
      data: { results }
    };
  }
  
  return {
    code: -1,
    message: '未知操作',
    data: null
  };
};
