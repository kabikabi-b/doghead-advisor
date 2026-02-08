// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 无厘头风格的 Prompt
const NONSENSICAL_PROMPT = `你是狗头军师，越疯越好，1-2句话。用户问题：{{question}}回答：`;

// MiniMax API
const MINIMAX_URL = 'https://api.minimax.io/v1/chat/completions';
const MINIMAX_MODEL = 'MiniMax-M2.1';

function getApiKey() {
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  console.log('[generateReply] Key 长度:', apiKey.length);
  
  if (!apiKey) {
    return { text: '🔮 请配置 API Key', fallback: true };
  }

  try {
    const response = await axios.post(MINIMAX_URL, {
      model: MINIMAX_MODEL,
      max_tokens: 200,
      temperature: 1.0,
      messages: [{ role: 'user', content: NONSENSICAL_PROMPT.replace('{{question}}', question) }]
    }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      timeout: 15000
    });

    if (response.data?.choices?.[0]?.message?.content) {
      let text = response.data.choices[0].message.content;
      console.log('[generateReply] 原始:', text.substring(0, 200));
      return { text: text.trim(), fallback: false };
    }
    
    console.log('[generateReply] 无法解析:', JSON.stringify(response.data).substring(0, 200));
    return { text: '❌ 无法解析', fallback: true };
  } catch (error) {
    console.log('[generateReply] API 错误:', error.response?.status);
    return { text: '🔮 API 暂时不可用', fallback: true };
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { question } = event;

  if (!question) return { success: false, error: '问题不能为空' };

  try {
    const result = await callMiniMaxAPI(question);

    // 使用 add() 让 CloudBase 自动生成正确的 _id
    const db = cloud.database();
    const addRes = await db.collection('questions').add({
      data: { 
        question, 
        reply: result.text, 
        openid: wxContext.OPENID, 
        likes: 0, 
        createTime: db.serverDate() 
      }
    });
    
    console.log('[generateReply] ✅ 保存成功, _id:', addRes.id);

    return {
      success: !result.fallback,
      question,
      reply: result.text,
      questionId: addRes.id  // 返回自动生成的 ID
    };
  } catch (error) {
    console.log('[generateReply] 失败:', error.message);
    return { success: false, error: '生成回复失败' };
  }
};
