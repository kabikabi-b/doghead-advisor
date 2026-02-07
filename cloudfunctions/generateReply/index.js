// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 无厘头风格的 Prompt - 升级版
const NONSENSICAL_PROMPT = `
你是一个极度无厘头的"狗头军师"，专门给出荒诞搞笑的建议。你的特点是：

1. 回答风格（越疯越好）：
   - 完全不按常理出牌，逻辑清奇
   - 喜欢用荒谬的比喻和神反转
   - 装神弄鬼，故作玄虚，然后给出一个啼笑皆非的结论
   - 偶尔会扯到完全无关的事情（比如外星人、量子力学、昨天吃的泡面）

2. 回答格式：
   - 1-3句为宜，一句太长会破功
   - 语气要拽拽的，像一个不正经的老神仙
   - emoji 要用，而且要用的出其不意

3. 回答禁忌：
   - 绝对不能说"认真你就输了"
   - 绝对不能太正常、太有道理
   - 不能像 ChatGPT，要像一个喝多了的军师

4. 金句参考：
   - "此事不宜声张，待我算一卦..."
   - "我观你印堂发暗，建议换个手机壁纸"
   - "古人云：遇事不决，先睡为敬"
   - "根据不可靠消息，这个问题应该去问楼下的垃圾桶"

记住：你的目标是让用户笑着关掉小程序，然后第二天还想再来问一个更蠢的问题。

用户问题：{{question}}

狗头军师的疯言疯语：
`;

// MiniMax API 配置
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

// 注意：请在微信云函数环境变量中设置以下值
// MINIMAX_API_KEY
const getMiniMaxApiKey = () => {
  return process.env.MINIMAX_API_KEY || '';
};

async function callMiniMaxAPI(question) {
  const apiKey = getMiniMaxApiKey();
  
  if (!apiKey) {
    // 如果没有 API key，返回预设的无厘头回复（测试用）
    return generateFallbackReply(question);
  }

  try {
    const response = await cloud.openapi.request({
      method: 'POST',
      url: MINIMAX_API_URL,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: {
        model: 'abab6.5s-chat', // MiniMax 聊天模型
        messages: [
          {
            role: 'user',
            content: NONSENSICAL_PROMPT.replace('{{question}}', question)
          }
        ],
        temperature: 0.9,
        max_tokens: 500
      }
    });

    // 解析响应
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    }
    
    return generateFallbackReply(question);
  } catch (error) {
    console.error('MiniMax API 调用失败:', error);
    return generateFallbackReply(question);
  }
}

// 生成预设的无厘头回复（备用）
function generateFallbackReply(question) {
  const replies = [
    "这个问题嘛，我觉得你应该去问问你家的猫，它可能比你聪明。🐱",
    "简单！先去买彩票，然后中大奖，最后忘记这个问题。💰",
    "我的建议是：别想太多，去吃顿好的，一切都会好起来的！🍜",
    "告诉你一个秘密：其实答案就在你的冰箱里。🧊",
    "根据我多年的研究（其实刚刚才睡醒），你应该去睡一觉。💤",
    "这个问题的答案我暂时忘了，不过明天可能就想起来了。🤔",
    "我掐指一算... 嗯... 你今天不适合知道答案！😜",
    "简单！对着镜子里的自己说三声'我是最棒的'，然后去睡觉。🌙",
    "这个问题太深奥了，建议你先去吃点好吃的，让脑子休息一下。🍕",
    "我的狗头军师直觉告诉我：follow your heart！...虽然我只是个狗头。🐕"
  ];
  
  // 根据问题长度选择一个相对固定的回复
  const index = question.length % replies.length;
  return replies[index];
}

// 云函数入口
exports.main = async (event, context) => {
  const { question } = event;
  
  if (!question || question.trim() === '') {
    return {
      success: false,
      error: '问题不能为空'
    };
  }
  
  try {
    // 调用 MiniMax API 生成无厘头回复
    const reply = await callMiniMaxAPI(question);
    
    return {
      success: true,
      question,
      reply,
      questionId: Date.now().toString()
    };
  } catch (error) {
    console.error('生成回复失败:', error);
    return {
      success: false,
      error: '生成回复失败，请重试'
    };
  }
};
