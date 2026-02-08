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

// MiniMax API 端点列表
const MINIMAX_API_URLS = [
  'https://api.minimax.io/v1/chat/completions',   // OpenAI 兼容
  'https://api.minimax.io/v1/text/chatcompletion_v2', // 常规 MiniMax
  'https://api.minimaxi.com/v1/chat/completions',   // 中国区
  'https://api.minimaxi.com/v1/text/chatcompletion_v2' // 中国区
];
const MINIMAX_MODEL = 'MiniMax-M2.1';

function getApiKey() {
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  
  console.log('[generateReply] ========== DEBUG ==========');
  console.log('[generateReply] Model:', MINIMAX_MODEL);
  console.log('[generateReply] API Key 长度:', apiKey.length);
  console.log('[generateReply] API Key 前缀:', apiKey.substring(0, 10) + '...');
  
  if (!apiKey) {
    return generateFallbackReply(question, { reason: 'NO_API_KEY' });
  }

  // 尝试多个端点
  for (const apiUrl of MINIMAX_API_URLS) {
    try {
      console.log('[generateReply] 🔄 尝试端点:', apiUrl);

      const response = await axios.post(apiUrl, {
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
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 15000
      });

      console.log('[generateReply] 📥 响应状态:', response.status);
      console.log('[generateReply] 响应结构:', Object.keys(response.data));

      // 解析响应
      let reply = null;
      
      // OpenAI 格式: choices[0].message.content
      if (response.data?.choices?.[0]?.message?.content) {
        reply = response.data.choices[0].message.content.trim();
        console.log('[generateReply] ✅ OpenAI 格式:', reply);
        return reply;
      }
      // MiniMax 格式: content[0].text
      else if (response.data?.content?.[0]?.text) {
        reply = response.data.content[0].text.trim();
        console.log('[generateReply] ✅ MiniMax 格式:', reply);
        return reply;
      }
      // choices[0].content
      else if (response.data?.choices?.[0]?.content) {
        reply = response.data.choices[0].content.trim();
        console.log('[generateReply] ✅ choices.content:', reply);
        return reply;
      }
      
      console.log('[generateReply] ⚠️ 响应数据:', JSON.stringify(response.data).substring(0, 500));
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      console.log('[generateReply] ❌ 端点失败:', apiUrl, 'status:', status);
      
      if (errorData) {
        console.log('[generateReply] 错误数据:', JSON.stringify(errorData).substring(0, 200));
      }
    }
  }
  
  console.error('[generateReply] ❌ 所有端点都失败');
  return generateFallbackReply(question, { 
    reason: 'ALL_ENDPOINTS_FAILED',
    error: '尝试了 ' + MINIMAX_API_URLS.length + ' 个端点都失败'
  });
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
