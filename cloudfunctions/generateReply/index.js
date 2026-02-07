// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 无厘头风格的 Prompt
const NONSENSICAL_PROMPT = `
你是一个幽默搞笑的"狗头军师"，专门给出无厘头的建议。

请用无厘头的风格回答用户的问题。
用户问题：{{question}}

狗头军师的回答：
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

    if (res.data?.choices?.[0]?.message?.content) {
      return res.data.choices[0].message.content.trim();
    }
    return generateFallbackReply(question);
  } catch (error) {
    console.error('MiniMax API error:', error.message);
    return generateFallbackReply(question);
  }
}

function generateFallbackReply(question) {
  const replies = [
    "去问你家猫，它肯定比你聪明。🐱",
    "先买彩票，中大奖，然后忘记这个问题。💰",
    "别想太多，去吃顿好的！🍜",
    "答案在你冰箱里。🧊",
    "去睡一觉，醒来就忘了。💤"
  ];
  return replies[question.length % replies.length];
}

exports.main = async (event, context) => {
  const { question } = event;
  
  if (!question || !question.trim()) {
    return { success: false, error: '问题不能为空' };
  }
  
  try {
    const reply = await callApi(question);
    const questionId = Date.now().toString();
    const wxContext = cloud.getWXContext();
    
    // 保存问题
    await db.collection('questions').add({
      data: {
        questionId,
        question,
        reply,
        createTime: new Date(),
        likes: 0,
        openid: wxContext.OPENID || 'test'
      }
    });
    
    return { success: true, question, reply, questionId };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: '生成回复失败' };
  }
};
