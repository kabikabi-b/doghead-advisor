// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 无厘头风格的 Prompt - 极简暴力版
const NONSENSICAL_PROMPT = `
你是狗头军师，一只西高地白梗。

你的职责是用最荒诞、最无厘头的方式回答问题。

规则：
- 越疯越好，越离谱越好
- 1-2句话，必须短
- 像喝醉的老神仙一样说话
- 可以突然扯到完全无关的事情
- 不许正常，不许有道理

用户问题：{{question}}

回答：
`;

// MiniMax Coding Plan API (Anthropic 兼容格式)
const MINIMAX_API_URL = 'https://api.minimax.io/anthropic';
const MINIMAX_MODEL = 'MiniMax-M2.1';

function getApiKey() {
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  
  console.log('[generateReply] ========== DEBUG ==========');
  console.log('[generateReply] API URL:', MINIMAX_API_URL);
  console.log('[generateReply] Model:', MINIMAX_MODEL);
  console.log('[generateReply] API Key 长度:', apiKey.length);
  console.log('[generateReply] API Key 前缀:', apiKey.substring(0, 10) + '...');
  
  if (!apiKey) {
    return generateFallbackReply(question, { reason: 'NO_API_KEY' });
  }

  try {
    console.log('[generateReply] 🔄 调用 LLM (Anthropic 格式)...');

    // Anthropic API 格式
    const response = await axios.post(MINIMAX_API_URL, {
      model: MINIMAX_MODEL,
      max_tokens: 200,
      temperature: 1.1,
      messages: [
        {
          role: 'user',
          content: NONSENSICAL_PROMPT.replace('{{question}}', question)
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: 15000
    });

    console.log('[generateReply] 📥 响应状态:', response.status);

    // 解析 Anthropic 响应格式: content[0].text
    let reply = null;
    
    if (response.data?.content?.[0]?.text) {
      reply = response.data.content[0].text.trim();
      console.log('[generateReply] ✅ Anthropic 格式:', reply);
    }
    // OpenAI 兼容格式
    else if (response.data?.choices?.[0]?.message?.content) {
      reply = response.data.choices[0].message.content.trim();
      console.log('[generateReply] ✅ OpenAI 格式:', reply);
    }
    else if (reply) {
      return reply;
    }
    
    console.error('[generateReply] ⚠️ 无法解析响应');
    return generateFallbackReply(question, { 
      reason: 'PARSE_ERROR', 
      error: JSON.stringify(response.data) 
    });
  } catch (error) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    console.error('[generateReply] API 错误:', status || error.code);
    console.error('[generateReply] 错误详情:', errorData || error.message);
    
    return generateFallbackReply(question, { 
      reason: `API_ERROR_${status || 'UNKNOWN'}`,
      error: errorData ? JSON.stringify(errorData) : error.message
    });
  }
}

function generateFallbackReply(question, errorInfo = {}) {
  console.log('[generateReply] ⚠️ 使用预设回复, reason:', errorInfo.reason);
  
  const replies = [
    "我算了一卦... 你今天不适合知道答案！🔮",
    "建议你去问问楼下的垃圾桶，它知道的比我多。🗑️",
    "古人云：遇事不决，先睡为敬。💤",
    "换个手机壁纸，比什么都管用。📱",
    "我观你印堂发暗，建议多吃零食。🍪",
    "答案就在冰箱里，去找找！🧊",
    "别想了，去吃顿好的比什么都强。🍕"
  ];
  const index = question.length % replies.length;
  
  return {
    _fallback: true,
    _reason: errorInfo.reason || 'UNKNOWN',
    _error: errorInfo.error || null,
    text: replies[index]
  };
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { question } = event;

  console.log('[generateReply] 收到问题:', question);

  if (!question || question.trim() === '') {
    return { success: false, error: '问题不能为空' };
  }

  try {
    const questionId = Date.now().toString();
    const reply = await callMiniMaxAPI(question);

    if (typeof reply === 'object' && reply._fallback) {
      return {
        success: false,
        question,
        reply: reply.text,
        questionId,
        fallback: true,
        error: reply._reason,
        details: reply._error
      };
    }

    // 保存到数据库
    try {
      const db = cloud.database();
      await db.collection('questions').add({
        data: {
          _id: questionId,
          question,
          reply,
          openid: wxContext.OPENID,
          likes: 0,
          createTime: db.serverDate()
        }
      });
      console.log('[generateReply] ✅ 已保存, _id:', questionId);
    } catch (saveError) {
      console.error('[generateReply] 保存失败:', saveError.message);
      return {
        success: true,
        question,
        reply,
        questionId,
        saved: false,
        error: '保存失败，点赞不可用'
      };
    }

    return {
      success: true,
      question,
      reply,
      questionId
    };
  } catch (error) {
    console.error('[generateReply] 失败:', error);
    return { success: false, error: '生成回复失败' };
  }
};
