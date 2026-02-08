// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 无厘头风格的 Prompt
const NONSENSICAL_PROMPT = `
你是狗头军师，一只西高地白梗。
越疯越好，1-2句话。
用户问题：{{question}}
回答：
`;

const MINIMAX_URL = 'https://api.minimax.io/v1/chat/completions';
const MINIMAX_MODEL = 'MiniMax-M2.1';

function getApiKey() {
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  console.log('[generateReply] Key 长度:', apiKey.length, '前缀:', apiKey.substring(0, 8));
  
  if (!apiKey) {
    return generateFallbackReply(question, 'NO_API_KEY');
  }

  try {
    console.log('[generateReply] 调用 API...');
    
    const response = await axios.post(MINIMAX_URL, {
      model: MINIMAX_MODEL,
      max_tokens: 100,
      temperature: 1.0,
      messages: [{ role: 'user', content: NONSENSICAL_PROMPT.replace('{{question}}', question) }]
    }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      timeout: 10000
    });

    console.log('[generateReply] Status:', response.status);
    
    // 解析
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim();
    }
    if (response.data?.content?.[0]?.text) {
      return response.data.content[0].text.trim();
    }
    
    console.log('[generateReply] 无法解析:', JSON.stringify(response.data).substring(0, 200));
    return generateFallbackReply(question, 'PARSE_ERROR', JSON.stringify(response.data));
  } catch (error) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    console.log('[generateReply] API 错误:', status, errorData || error.message);
    return generateFallbackReply(question, `API_ERROR_${status}`, errorData || error.message);
  }
}

function generateFallbackReply(question, reason, error = null) {
  console.log('[generateReply] Fallback, reason:', reason, 'error:', error);
  const replies = ["🔮 建议你去问问楼下的垃圾桶", "💤 遇事先睡为敬", "📱 换个手机壁纸", "🍪 多吃零食", "🧊 答案在冰箱里"];
  return { _fallback: true, _reason: reason, _error: error, text: replies[question.length % replies.length] };
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { question } = event;

  if (!question) return { success: false, error: '问题不能为空' };

  try {
    const questionId = Date.now().toString();
    const reply = await callMiniMaxAPI(question);

    if (typeof reply === 'object' && reply._fallback) {
      return { success: false, question, reply: reply.text, questionId, fallback: true, error: reply._reason, details: reply._error };
    }

    // 保存
    try {
      const db = cloud.database();
      await db.collection('questions').add({
        data: { _id: questionId, question, reply, openid: wxContext.OPENID, likes: 0, createTime: db.serverDate() }
      });
      console.log('[generateReply] 保存成功, _id:', questionId);
    } catch (saveError) {
      console.log('[generateReply] 保存失败:', saveError.message);
    }

    return { success: true, question, reply, questionId };
  } catch (error) {
    console.log('[generateReply] 失败:', error);
    return { success: false, error: '生成回复失败' };
  }
};
