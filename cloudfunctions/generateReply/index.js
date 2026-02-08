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

// MiniMax API 端点
// Coding Plan 和常规 API 使用同一端点，区别在于 API Key 权限
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

function getApiKey() {
  // 优先从环境变量获取
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  
  console.log('[generateReply] ========== DEBUG START ==========');
  console.log('[generateReply] API Key 长度:', apiKey.length);
  console.log('[generateReply] API Key 前缀:', apiKey.substring(0, 10) + '...');
  console.log('[generateReply] API Key 包含 Bearer:', apiKey.startsWith('Bearer '));
  console.log('[generateReply] ========== DEBUG END ==========');
  console.log('[generateReply] 问题长度:', question.length);
  
  if (!apiKey) {
    console.log('[generateReply] ⚠️ 无 API Key，使用预设回复');
    return generateFallbackReply(question, { reason: 'NO_API_KEY' });
  }

  try {
    console.log('[generateReply] 🔄 调用 LLM...');
    console.log('[generateReply] 📤 发送请求到 MiniMax API');
    console.log('[generateReply] 📝 Model: abab6.5s-chat');
    console.log('[generateReply] 📝 Temperature: 1.1');

    // 检测 API Key 是否已经包含 "Bearer " 前缀
    const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
    console.log('[generateReply] Authorization header 长度:', authHeader.length);

    const response = await axios.post(MINIMAX_API_URL, {
      model: 'abab6.5s-chat',
      messages: [
        {
          role: 'user',
          content: NONSENSICAL_PROMPT.replace('{{question}}', question)
        }
      ],
      temperature: 1.1,
      max_tokens: 200,
      top_p: 0.9
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      timeout: 15000
    });

    console.log('[generateReply] 📥 收到响应');
    console.log('[generateReply] ✅ MiniMax 响应状态:', response.status);
    
    // 尝试多种响应格式
    let reply = null;
    
    // 格式1: OpenAI 标准格式 choices[0].message.content
    if (response.data?.choices?.[0]?.message?.content) {
      reply = response.data.choices[0].message.content.trim();
      console.log('[generateReply] ✅ 格式1 (message.content):', reply);
    }
    // 格式2: choices[0].content
    else if (response.data?.choices?.[0]?.content) {
      reply = response.data.choices[0].content.trim();
      console.log('[generateReply] ✅ 格式2 (content):', reply);
    }
    // 格式3: choices[0].text
    else if (response.data?.choices?.[0]?.text) {
      reply = response.data.choices[0].text.trim();
      console.log('[generateReply] ✅ 格式3 (text):', reply);
    }
    // 格式4: 直接 choices[0]
    else if (response.data?.choices?.[0]) {
      const choice = response.data.choices[0];
      const keys = Object.keys(choice);
      console.log('[generateReply] ⚠️ choices[0] 字段:', keys);
      // 尝试获取第一个字符串字段
      for (const key of keys) {
        if (typeof choice[key] === 'string' && choice[key].length > 0) {
          reply = choice[key].trim();
          console.log('[generateReply] ✅ 格式4 (' + key + '):', reply);
          break;
        }
      }
    }
    
    if (reply) {
      return reply;
    }
    
    // 仍然无法解析，输出完整响应
    console.error('[generateReply] ⚠️ 响应格式异常');
    console.error('[generateReply] ⚠️ 完整响应:', JSON.stringify(response.data, null, 2));
    return generateFallbackReply(question, { 
      reason: 'PARSE_ERROR', 
      error: JSON.stringify(response.data)
    });
  } catch (error) {
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    console.error('[generateReply] MiniMax API 错误:', status || error.code);
    console.error('[generateReply] 错误详情:', errorData || error.message);
    
    // 详细错误诊断
    let errorReason = 'API_ERROR';
    if (errorData && errorData.base_resp) {
      console.error('[generateReply] 状态码:', errorData.base_resp.status_code);
      console.error('[generateReply] 状态信息:', errorData.base_resp.status_msg);
      
      errorReason = `API_ERROR_${errorData.base_resp.status_code}_${errorData.base_resp.status_msg || ''}`;
    }
    
    return generateFallbackReply(question, { 
      reason: errorReason,
      error: errorData || error.message 
    });
  }
}

function generateFallbackReply(question, errorInfo = {}) {
  console.log('[generateReply] 🔄 使用预设回复（无 API Key 或 API 异常）');
  console.log('[generateReply] 错误信息:', JSON.stringify(errorInfo));
  
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
  const fallback = replies[index];
  
  console.log('[generateReply] 📦 预设回复:', fallback);
  
  // 返回详细信息，便于调试
  return {
    _fallback: true,
    _reason: errorInfo.reason || 'UNKNOWN',
    _error: errorInfo.error || null,
    text: fallback
  };
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { question } = event;

  console.log('[generateReply] 收到问题:', question);
  console.log('[generateReply] OPENID:', wxContext.OPENID);

  if (!question || question.trim() === '') {
    return { success: false, error: '问题不能为空' };
  }

  try {
    // 先生成 questionId，确保在保存前就生成
    const questionId = Date.now().toString();
    console.log('[generateReply] questionId:', questionId);

    const reply = await callMiniMaxAPI(question);

    // 如果返回的是对象（包含 _fallback），说明是预设回复
    if (typeof reply === 'object' && reply._fallback) {
      console.log('[generateReply] ⚠️ 使用预设回复，错误原因:', reply._reason);
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

    // 正常 LLM 回复
    console.log('[generateReply] 最终回复:', reply);

    // 保存问题到数据库（重要：必须保存，否则点赞功能无法使用）
    try {
      const db = cloud.database();
      await db.collection('questions').add({
        data: {
          _id: questionId,
          question: question,
          reply: typeof reply === 'string' ? reply : JSON.stringify(reply),
          openid: wxContext.OPENID,
          likes: 0,
          createTime: db.serverDate()
        }
      });
      console.log('[generateReply] ✅ 问题已保存到数据库, _id:', questionId);
    } catch (saveError) {
      console.error('[generateReply] ❌ 保存问题失败:', saveError);
      // 即使保存失败也返回成功（但用户点赞会失败）
      return {
        success: true,
        question,
        reply: typeof reply === 'string' ? reply : JSON.stringify(reply),
        questionId,
        saved: false,
        error: '问题已回答但未保存数据库，点赞功能不可用'
      };
    }

    return {
      success: true,
      question,
      reply,
      questionId
    };
  } catch (error) {
    console.error('[generateReply] 生成回复失败:', error);
    return { success: false, error: '生成回复失败，请重试' };
  }
};
