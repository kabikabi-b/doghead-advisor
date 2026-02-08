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

// MiniMax API
// 端点: https://api.minimax.chat/v1/text/chatcompletion_v2
// 注: Coding Plan 和常规 API 使用同一端点，区别在于 API Key 权限
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

function getApiKey() {
  // 优先从环境变量获取
  return process.env.MINIMAX_API_KEY || '';
}

async function callMiniMaxAPI(question) {
  const apiKey = getApiKey();
  
  console.log('[generateReply] API Key 长度:', apiKey.length);
  console.log('[generateReply] 问题长度:', question.length);
  
  if (!apiKey) {
    console.log('[generateReply] ⚠️ 无 API Key，使用预设回复');
    return generateFallbackReply(question);
  }

  // 优先尝试 Coding Plan 端点
  const endpoints = [
    { url: MINIMAX_API_URL_CODING, name: 'Coding Plan', isCoding: true },
    { url: MINIMAX_API_URL_REGULAR, name: 'Regular', isCoding: false }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`[generateReply] 🔄 调用 LLM (${endpoint.name} 端点)...`);
      console.log('[generateReply] 📤 发送请求到:', endpoint.url);
      console.log('[generateReply] 📝 Model: abab6.5s-chat');
      console.log('[generateReply] 📝 Temperature: 1.1');

      // 检测 API Key 是否已经包含 "Bearer " 前缀
      const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
      console.log('[generateReply] Authorization header 长度:', authHeader.length);

      const response = await axios.post(endpoint.url, {
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
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      console.error(`[generateReply] ${endpoint.name} 端点错误:`, status || error.code);
      console.error('[generateReply] 错误详情:', errorData || error.message);
      
      // 如果是认证错误 (401/2049) 或 404，尝试下一个端点
      if (status === 401 || status === 404 || (errorData && (errorData.base_resp?.status_code === 401 || errorData.base_resp?.status_code === 2049))) {
        console.log(`[generateReply] ${endpoint.name} 端点失败 (${status})，尝试下一个端点...`);
        continue;
      }
      
      // 其他严重错误（如网络超时）直接返回预设回复
      console.log(`[generateReply] ${endpoint.name} 端点严重错误，停止尝试`);
      return generateFallbackReply(question);
    }
  }
  
  // 所有端点都失败
  console.error('[generateReply] ⚠️ 所有 MiniMax 端点都无法调用');
  return generateFallbackReply(question);
}

function generateFallbackReply(question) {
  console.log('[generateReply] 🔄 使用预设回复（无 API Key 或 API 异常）');
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
  console.log('[generateReply] 📦 预设回复 index:', index, '问题长度:', question.length);
  console.log('[generateReply] 📦 预设回复内容:', replies[index]);
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
