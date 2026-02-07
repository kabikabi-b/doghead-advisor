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

// MiniMax API (Coding Plan)
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

function getApiKey() {
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.log('无 API Key，使用预设回复');
    return generateFallbackReply(question);
  }

  try {
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
      timeout: 10000
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const reply = response.data.choices[0].message.content.trim();
      console.log('MiniMax 回复:', reply);
      return reply;
    }
    
    return generateFallbackReply(question);
  } catch (error) {
    console.error('MiniMax API 错误:', error.response?.data || error.message);
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
  return replies[question.length % replies.length];
}

exports.main = async (event, context) => {
  const { question } = event;
  
  if (!question || question.trim() === '') {
    return { success: false, error: '问题不能为空' };
  }
  
  try {
    const reply = await callMiniMaxAPI(question);
    const questionId = Date.now().toString();
    
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
