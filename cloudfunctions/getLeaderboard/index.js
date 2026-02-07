// 云函数: getLeaderboard
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { filter = 'likes' } = event;
  const wxContext = cloud.getWXContext();
  
  try {
    // 获取排行榜数据
    const users = await db.collection('users')
      .orderBy(filter, 'desc')
      .limit(100)
      .get();
    
    // 获取当前用户排名
    let currentUserRank = null;
    if (wxContext.OPENID) {
      const currentUser = await db.collection('users')
        .where({ openid: wxContext.OPENID })
        .get();
      
      if (currentUser.data.length > 0) {
        const user = currentUser.data[0];
        // 计算排名
        const higherCount = await db.collection('users')
          .where({
            [filter]: db.command.gt(user.stats ? user.stats[filter] || 0 : 0)
          })
          .count();
        
        currentUserRank = {
          ...user,
          rank: higherCount.total + 1
        };
      }
    }
    
    return {
      success: true,
      list: users.data.map((u, index) => ({
        id: u._id,
        name: u.nickName || '匿名用户',
        avatar: u.avatarUrl || '🐕',
        likes: u.stats?.totalLikes || 0,
        guguRate: u.stats?.guguRate || 0,
        score: u.stats?.[filter] || 0
      })),
      currentUserRank
    };
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return {
      success: false,
      error: error.message,
      // 返回模拟数据用于演示
      list: [
        { id: '1', name: '怼神降临', avatar: '🦁', likes: 1234, guguRate: 99, score: 1234 },
        { id: '2', name: '机智小狐狸', avatar: '🦊', likes: 987, guguRate: 85, score: 987 },
        { id: '3', name: '快乐小狗', avatar: '🐕', likes: 856, guguRate: 72, score: 856 },
        { id: '4', name: '佛系青年', avatar: '🧘', likes: 654, guguRate: 60, score: 654 },
        { id: '5', name: '乐观向上', avatar: '🌟', likes: 543, guguRate: 45, score: 543 }
      ],
      currentUserRank: null
    };
  }
};
