// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 无厘头风格的 Prompt
const NONSENSICAL_PROMPT = `
你是一个幽默搞笑的"狗头军师"，专门给出无厘头的建议。你的特点是：

1. 回答风格：
   - 幽默、搞笑、不按常理出牌
   - 经常使用夸张、比喻、反转的修辞手法
   - 让人意想不到但又忍俊不禁

2. 回答格式：
   - 简洁有力，1-3句话为宜
   - 口语化，像朋友聊天
   - 可以适当使用 emoji

3. 回答原则：
   - 不说教、不讲大道理
   - 用轻松的方式给出建议
   - 保持乐观积极的态度

请用无厘头的风格回答用户的问题。
用户问题：{{question}}

狗头军师的回答：
`;

// MiniMax API 配置
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

const getMiniMaxApiKey = () => {
  return process.env.MINIMAX_API_KEY || '';
};

async function callMiniMaxAPI(question) {
  const apiKey = getMiniMaxApiKey();
  
  if (!apiKey) {
    return generateFallbackReply(question);
  }

  try {
    const response = await cloud.openapi.request({
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

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    }
    return generateFallbackReply(question);
  } catch (error) {
    console.error('MiniMax API 调用失败:', error);
    return generateFallbackReply(question);
  }
}

function generateFallbackReply(question) {
  const replies = [
    "这个问题嘛，我觉得你应该去问问你家的猫，它可能比你聪明。🐱",
    "简单！先去买彩票，然后中大奖，最后忘记这个问题。💰",
    "我的建议是：别想太多，去吃顿好的，一切都会好起来的！🍜",
    "告诉你一个秘密：其实答案就在你的冰箱里。🧊",
    "根据我多年的研究（其实刚刚才睡醒），你应该去睡一觉。💤",
    "这个问题的答案我暂时忘了，不过明天可能就想起来了。🤔",
    "我掐指一算... 嗯... 你今天不适合知道答案！😜",
    "简单！对着镜子里的自己说三声'我是最棒的'，然后去睡觉。🌙",
    "这个问题太深奥了，建议你先去吃点好吃的，让脑子休息一下。🍕",
    "我的狗头军师直觉告诉我：follow your heart！...虽然我只是个狗头。🐕"
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
    // 生成回复
    const reply = await callMiniMaxAPI(question);
    const questionId = Date.now().toString();
    
    // 保存问题到 questions collection
    await db.collection('questions').add({
      data: {
        questionId: questionId,
        question: question,
        reply: reply,
        createTime: new Date(),
        likes: 0,
        openid: wxContext.OPENID
      }
    });
    
    return {
      success: true,
      question,
      reply,
      questionId
    };
  } catch (error) {
    console.error('生成回复失败:', error);
    return { success: false, error: '生成回复失败，请重试' };
  }
};
