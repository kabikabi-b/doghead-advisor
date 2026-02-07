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

// MiniMax API - 支持 Coding Plan
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

function getApiKey() {
  // 优先从环境变量获取
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  
  console.log('[generateReply] API Key 长度:', apiKey.length);
  
  if (!apiKey) {
    console.log('[generateReply] 无 API Key，使用预设回复');
    return generateFallbackReply(question);
  }

  try {
    console.log('[generateReply] 正在调用 MiniMax API...');
    
    // Coding Plan 认证方式
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
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 15000
    });

    console.log('[generateReply] MiniMax 响应状态:', response.status);
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const reply = response.data.choices[0].message.content.trim();
      console.log('[generateReply] MiniMax 回复:', reply);
      return reply;
    }
    
    console.log('[generateReply] MiniMax 响应格式异常，使用预设');
    return generateFallbackReply(question);
  } catch (error) {
    console.error('[generateReply] MiniMax API 错误:', error.response?.status || error.code);
    console.error('[generateReply] 错误详情:', error.response?.data || error.message);
    return generateFallbackReply(question);
  }
}

function generateFallbackReply(question) {
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
  console.log('[generateReply] 使用预设回复 index:', index, '问题长度:', question.length);
  return replies[index];
}

exports.main = async (event, context) => {
  const { question } = event;
  
  console.log('[generateReply] 收到问题:', question);
  
  if (!question || question.trim() === '') {
    return { success: false, error: '问题不能为空' };
  }
  
  try {
    const reply = await callMiniMaxAPI(question);
    const questionId = Date.now().toString();
    
    console.log('[generateReply] 最终回复:', reply);
    
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
