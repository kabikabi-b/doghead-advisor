const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const { question } = event
  
  // 调用 AI API 生成无厘头回复
  // 这里可以接入 MiniMax 或其他 AI 服务
  
  const reply = generateFunnyReply(question)
  
  return {
    success: true,
    answer: reply
  }
}

function generateFunnyReply(question) {
  // 简单的无厘头回复逻辑
  const replies = [
    "这个问题嘛，我觉得你应该反过来问自己...",
    "简单！你就回他一句：'不好意思，我今天耳屎太多...'",
    "你就说：'你这问题问得我都不敢回答了，怕伤了你自尊'",
    "最好的回复就是不要回复，让他自己尴尬去吧！😏"
  ]
  return replies[Math.floor(Math.random() * replies.length)]
}
