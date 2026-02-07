// 云函数入口文件
const cloud = require('wx-server-sdk');
const db = cloud.database();

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 无厘头风格的 Prompt - 升级版（更疯癫）
const NONSENSICAL_PROMPT = `
你是一个极度无厘头的"狗头军师"，专门给出荒诞搞笑的建议。你的特点是：

1. 回答风格（越疯越好）：
   - 完全不按常理出牌，逻辑清奇
   - 喜欢用荒谬的比喻和神反转
   - 装神弄鬼，故作玄虚，然后给出一个啼笑皆非的结论
   - 偶尔会扯到完全无关的事情（比如外星人、量子力学、昨天吃的泡面）

2. 回答格式：
   - 1-3句为宜，一句太长会破功
   - 语气要拽拽的，像一个不正经的老神仙
   - emoji 要用，而且要用的出其不意

3. 回答禁忌：
   - 绝对不能说"认真你就输了"
   - 绝对不能太正常、太有道理
   - 不能像 ChatGPT，要像一个喝多了的军师

4. 金句参考：
   - "此事不宜声张，待我算一卦..."
   - "我观你印堂发暗，建议换个手机壁纸"
   - "古人云：遇事不决，先睡为敬"
   - "根据不可靠消息，这个问题应该去问楼下的垃圾桶"

记住：你的目标是让用户笑着关掉小程序，然后第二天还想再来问一个更蠢的问题。

用户问题：{{question}}

狗头军师的疯言疯语：
`;

// MiniMax API 配置
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

function getApiKey() {
  return process.env.MINIMAX_API_KEY || '';
}

async function callApi(question) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return generateFallbackReply(question);
  }

  try {
    const res = await cloud.openapi.request({
      method: 'POST',
      url: MINIMAX_API_URL,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: {
        model: 'abab6.5s-chat',
        messages: [{
          role: 'user',
          content: NONSENSICAL_PROMPT.replace('{{question}}', question)
        }],
        temperature: 0.9,
        max_tokens: 500
      }
    });

    if (res.data && res.data.choices && res.data.choices.length > 0) {
      return res.data.choices[0].message.content.trim();
    }
    return generateFallbackReply(question);
  } catch (error) {
    console.error('MiniMax API 调用失败:', error);
    return generateFallbackReply(question);
  }
}

function generateFallbackReply(question) {
  const replies = [
    "此事不宜声张，建议去问问楼下的垃圾桶。🗑️",
    "我掐指一算... 你今天不适合知道答案！😜",
    "简单！先去买彩票，然后忘记这个问题。💰",
    "根据我的研究（刚睡醒），你应该去吃顿好的。🍕",
    "答案就在你的冰箱里，去找找看！🧊",
    "古人云：遇事不决，先睡为敬。💤",
    "我观你印堂发暗，建议换个手机壁纸。📱",
    "这个问题太深奥了，建议你先吃零食。🍪"
  ];
  const index = question.length % replies.length;
  return replies[index];
}

exports.main = async (event, context) => {
  const { question } = event;
  const wxContext = cloud.getWXContext();
  
  if (!question || question.trim() === '') {
    return { success: false, error: '问题不能为空' };
  }
  
  try {
    const reply = await callApi(question);
    const questionId = Date.now().toString();
    
    // 保存到数据库
    await db.collection('answers').add({
      data: {
        _id: questionId,
        question,
        reply,
        likes: 0,
        createTime: new Date()
      }
    });
    
    return { success: true, question, reply, questionId };
  } catch (error) {
    console.error('生成回复失败:', error);
    return { success: false, error: '生成回复失败，请重试' };
  }
};
