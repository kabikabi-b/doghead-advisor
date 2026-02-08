// MiniMax API 响应格式测试脚本
// 用途：测试 Coding Plan 的 MiniMax API 返回格式

// 模拟各种可能的响应格式
const mockResponses = {
  // 格式1: OpenAI 标准格式
  openai: {
    data: {
      id: "gen_xxx",
      object: "chat.completion",
      created: 1234567890,
      model: "abab6.5s-chat",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "建议你直接离职算了！"
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150
      }
    },
    status: 200
  },

  // 格式2: MiniMax 直接格式 (choices[0].content)
  minimaxDirect: {
    data: {
      base_resp: {
        status_code: 0,
        status_msg: "Success"
      },
      choices: [
        {
          finish_reason: "stop",
          index: 0,
          message: {
            role: "assistant",
            content: "建议你直接离职算了！"
          }
        }
      ],
      usage: {
        total_tokens: 150
      }
    },
    status: 200
  },

  // 格式3: MiniMax Coding Plan 可能的新格式 (choices[0].text)
  minimaxText: {
    data: {
      choices: [
        {
          "text": "建议你直接离职算了！",
          "index": 0,
          "logprobs": null,
          "finish_reason": "stop"
        }
      ],
      "object": "chat.completion",
      "usage": {
        "prompt_tokens": 100,
        "completion_tokens": 50,
        "total_tokens": 150
      },
      "model": "abab6.5s-chat"
    },
    status: 200
  },

  // 格式4: MiniMax 新版响应 (base_resp + content in different structure)
  minimoxNew: {
    data: {
      "base_resp": {
        "status_code": 0,
        "status_msg": "Success",
        "cost_time": 0.5
      },
      "choices": [
        {
          "finish_reason": "stop",
          "index": 0,
          "message": {
            "content": "建议你直接离职算了！",
            "role": "assistant"
          }
        }
      ]
    },
    status: 200
  }
};

// 测试解析函数
function parseMiniMaxResponse(response) {
  console.log('\n========== 测试响应解析 ==========');
  console.log('响应状态:', response.status);
  console.log('完整响应:', JSON.stringify(response.data, null, 2));

  let reply = null;
  const data = response.data;

  // 格式1: OpenAI 标准格式 choices[0].message.content
  if (data?.choices?.[0]?.message?.content) {
    reply = data.choices[0].message.content.trim();
    console.log('\n✅ 格式1 (message.content):', reply);
  }
  // 格式2: MiniMax 直接格式 choices[0].message.content
  else if (data?.choices?.[0]?.message?.content) {
    reply = data.choices[0].message.content.trim();
    console.log('\n✅ 格式2 (message.content):', reply);
  }
  // 格式3: choices[0].content
  else if (data?.choices?.[0]?.content) {
    reply = data.choices[0].content.trim();
    console.log('\n✅ 格式3 (content):', reply);
  }
  // 格式4: choices[0].text
  else if (data?.choices?.[0]?.text) {
    reply = data.choices[0].text.trim();
    console.log('\n✅ 格式4 (text):', reply);
  }
  // 格式5: 直接 choices[0]
  else if (data?.choices?.[0]) {
    const choice = data.choices[0];
    const keys = Object.keys(choice);
    console.log('\n⚠️ choices[0] 字段:', keys);
    for (const key of keys) {
      if (typeof choice[key] === 'string' && choice[key].length > 0) {
        reply = choice[key].trim();
        console.log('✅ 格式5 (' + key + '):', reply);
        break;
      }
    }
  }

  if (reply) {
    console.log('\n🎉 成功解析! 回复:', reply);
    return reply;
  }

  console.log('\n❌ 无法解析响应');
  return null;
}

// 运行所有格式的测试
console.log('MiniMax API 响应格式测试\n');
console.log('='.repeat(50));

Object.keys(mockResponses).forEach((formatName) => {
  console.log(`\n📋 测试格式: ${formatName}`);
  console.log('-'.repeat(50));
  const mockResponse = mockResponses[formatName];
  parseMiniMaxResponse(mockResponse);
});

console.log('\n' + '='.repeat(50));
console.log('测试完成！');
