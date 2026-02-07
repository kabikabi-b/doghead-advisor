/**
 * 数据库初始化工具
 * 
 * 自动检查并初始化数据库集合
 */

const COLLECTIONS = ['questions', 'votes', 'users'];

/**
 * 检查数据库集合是否可用
 */
async function checkCollections() {
  const results = [];
  
  for (const name of COLLECTIONS) {
    try {
      await wx.cloud.database().collection(name).count();
      results.push({ name, ready: true });
    } catch (error) {
      results.push({ name, ready: false, error: error.errMsg });
    }
  }
  
  return results;
}

/**
 * 初始化数据库
 * 如果集合不存在，尝试创建（通过插入测试数据）
 */
async function initDatabase() {
  const results = [];
  
  for (const name of COLLECTIONS) {
    try {
      // 尝试插入一条测试数据来创建集合
      await wx.cloud.database().collection(name).add({
        data: {
          _test: true,
          _createTime: new Date()
        }
      });
      
      // 删除测试数据
      try {
        const { data } = await wx.cloud.database().collection(name).where({ _test: true }).get();
        if (data.length > 0) {
          await wx.cloud.database().collection(name).doc(data[0]._id).remove();
        }
      } catch (e) {}
      
      results.push({ name, ready: true, action: 'created' });
    } catch (error) {
      console.error(`初始化集合 ${name} 失败:`, error);
      results.push({ name, ready: false, error: error.errMsg });
    }
  }
  
  return results;
}

/**
 * 获取所有未就绪的集合
 */
function getNotReadyCollections(results) {
  return results.filter(r => !r.ready).map(r => r.name);
}

/**
 * 检查并提示用户
 */
async function checkAndNotify() {
  const results = await checkCollections();
  const notReady = getNotReadyCollections(results);
  
  if (notReady.length > 0) {
    wx.showModal({
      title: '数据库待初始化',
      content: `以下集合需要初始化: ${notReady.join(', ')}`,
      confirmText: '立即初始化',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '初始化中...' });
          const initResults = await initDatabase();
          wx.hideLoading();
          
          const stillNotReady = getNotReadyCollections(initResults);
          if (stillNotReady.length === 0) {
            wx.showToast({ title: '初始化成功!', icon: 'success' });
          } else {
            wx.showModal({
              title: '部分集合初始化失败',
              content: `以下集合仍有问题: ${stillNotReady.join(', ')}`,
              showCancel: false,
              confirmText: '知道了'
            });
          }
        }
      }
    });
  }
  
  return results;
}

module.exports = {
  checkCollections,
  initDatabase,
  checkAndNotify,
  getNotReadyCollections,
  COLLECTIONS
};
