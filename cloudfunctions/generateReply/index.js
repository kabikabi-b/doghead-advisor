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
  console.log('[generateReply] Key:', apiKey.substring(0, 10) + '...');
  
  if (!apiKey) {
    return { fallback: true, text: '🔮 请配置 API Key', reason: 'NO_KEY' };
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
      console.log('[generateReply] 原始长度:', text.length);
      
      // 过滤思考标签
      text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
      text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
      text = text.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
      text = text.replace(/<reflexion>[\s\S]*?<\/reflexion>/gi, '');
      text = text.replace(/\n?<delete_file>\n?/gi, '');
      text = text.replace(/\n?<｜think｜>\n?/gi, '');
      text = text.replace(/<｜think｜>[\s\S]*?<｜think｜>/gi, '');
      text = text.trim();
      
      console.log('[generateReply] 过滤后长度:', text.length);
      
      // 无论是否过滤成功都返回
      return { fallback: false, text: text || response.data.choices[0].message.content.trim() };
    }
    
    return { fallback: true, text: '❌ 无法解析', reason: 'PARSE_ERROR', raw: JSON.stringify(response.data) };
  } catch (error) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    console.log('[generateReply] API 错误:', status, errorData?.message || errorData);
    return { fallback: true, text: '🔮 API 暂时不可用', reason: `API_ERROR_${status}`, error: errorData?.message || errorData };
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { question } = event;

  if (!question) return { success: false, error: '问题不能为空' };

  try {
    const questionId = Date.now().toString();
    const result = await callMiniMaxAPI(question);

    // 保存到数据库
    try {
      const db = cloud.database();
      await db.collection('questions').doc(questionId).set({
        data: { question, reply: result.text, openid: wxContext.OPENID, likes: 0, createTime: db.serverDate() }
      });
      console.log('[generateReply] ✅ 已保存');
    } catch (e) {
      console.log('[generateReply] 保存失败:', e.message);
    }

    return {
      success: !result.fallback,
      question,
      reply: result.text,
      questionId,
      fallback: result.fallback,
      reason: result.reason
    };
  } catch (error) {
    return { success: false, error: '生成回复失败' };
  }
};
