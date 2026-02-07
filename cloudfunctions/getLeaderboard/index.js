// 云函数: getLeaderboard
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { filter = 'likes' } = event;
  const wxContext = cloud.getWXContext();
  
  try {
    let rankList = [];
    let currentUserRank = null;
    
    if (filter === 'likes') {
      // 按点赞数获取问题列表
      const questions = await db.collection('questions')
        .orderBy('likes', 'desc')
        .limit(50)
        .get();
      
      rankList = questions.data.map((q, index) => ({
        id: q._id,
        question: q.question,
        likes: q.likes || 0,
        score: q.likes || 0,
        rank: index + 1
      }));
      
      // 获取当前用户的问题中最高点赞排名
      if (wxContext.OPENID) {
        const myQuestions = await db.collection('questions')
          .where({ openid: wxContext.OPENID })
          .get();
        
        if (myQuestions.data.length > 0) {
          // 找到最高点赞的问题
          const topQuestion = myQuestions.data.reduce((max, q) => 
            (q.likes || 0) > (max.likes || 0) ? q : max
          , { likes: 0 });
          
          // 计算排名
          const higherCount = await db.collection('questions')
            .where({ likes: db.command.gt(topQuestion.likes || 0) })
            .count();
          
          currentUserRank = {
            rank: higherCount.total + 1,
            likes: topQuestion.likes || 0,
            question: topQuestion.question
          };
        }
      }
    } else {
      // 按提问数获取（模拟）
      const questions = await db.collection('questions')
        .orderBy('createTime', 'desc')
        .limit(50)
        .get();
      
      // 按用户聚合
      const userMap = {};
      questions.data.forEach(q => {
        if (!userMap[q.openid]) {
          userMap[q.openid] = {
            id: q.openid,
            questionCount: 0,
            questions: []
          };
        }
        userMap[q.openid].questionCount++;
        userMap[q.openid].questions.push(q.question);
      });
      
      rankList = Object.values(userMap)
        .sort((a, b) => b.questionCount - a.questionCount)
        .slice(0, 50)
        .map((u, index) => ({
          id: u.id,
          question: u.questions[0], // 显示第一个问题
          questionCount: u.questionCount,
          score: u.questionCount,
          rank: index + 1
        }));
      
      // 当前用户排名
      if (wxContext.OPENID && userMap[wxContext.OPENID]) {
        const myIndex = rankList.findIndex(u => u.id === wxContext.OPENID);
        currentUserRank = {
          rank: myIndex + 1,
          questionCount: userMap[wxContext.OPENID].questionCount
        };
      }
    }
    
    return {
      success: true,
      list: rankList,
      currentUserRank
    };
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return {
      success: false,
      error: error.message,
      list: [],
      currentUserRank: null
    };
  }
};
