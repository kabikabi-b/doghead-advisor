#!/usr/bin/env node
/**
 * 本地测试 generateReply 和 vote 云函数
 */

const fs = require('fs');
const path = require('path');

// 模拟云函数运行环境
const mockEnv = {
  OPENID: 'test_user_openid_123',
  APPID: 'wx3ae4dfecd97351ea',
  UNIONID: 'test_unionid_456'
};

// 读取云函数代码
const generateReplyCode = fs.readFileSync(
  path.join(__dirname, '../cloudfunctions/generateReply/index.js'),
  'utf8'
);

const voteCode = fs.readFileSync(
  path.join(__dirname, '../cloudfunctions/vote/index.js'),
  'utf8'
);

console.log('='.repeat(60));
console.log('代码审查报告');
console.log('='.repeat(60));

// 1. 检查 generateReply 的 ID 生成逻辑
console.log('\n1. generateReply 分析:');
console.log('-'.repeat(40));

if (generateReplyCode.includes('add()')) {
  console.log('✅ 使用 add() 自动生成 _id');
}

if (generateReplyCode.includes('addRes.id')) {
  console.log('✅ 返回 addRes.id 作为 questionId');
} else if (generateReplyCode.includes('addRes._id')) {
  console.log('⚠️ 使用 addRes._id（可能不正确）');
}

if (generateReplyCode.includes('await')) {
  console.log('✅ 使用 await 等待异步操作');
}

// 2. 检查 vote 的 ID 查询逻辑
console.log('\n2. vote 分析:');
console.log('-'.repeat(40));

if (voteCode.includes('.doc(id).get()')) {
  console.log('✅ 使用 doc(id).get() 查询文档');
}

if (voteCode.includes('targetCollection')) {
  console.log('✅ 根据 type 确定目标集合');
}

// 3. 检查前端 questionId 传递
console.log('\n3. 前端 index.js 分析:');
console.log('-'.repeat(40));

const indexCode = fs.readFileSync(
  path.join(__dirname, '../pages/index/index.js'),
  'utf8'
);

if (indexCode.includes('questionId')) {
  const questionIdMatch = indexCode.match(/questionId\s*\??/g);
  if (questionIdMatch) {
    console.log('✅ 找到 questionId 相关代码');
  }
}

if (indexCode.includes("'&questionId='")) {
  console.log('✅ URL 中包含 questionId 参数');
} else if (indexCode.includes('questionId ||')) {
  console.log('⚠️ 使用 questionId || "" 可能导致空值');
}

const resultCode = fs.readFileSync(
  path.join(__dirname, '../pages/result/result.js'),
  'utf8'
);

if (resultCode.includes('options.questionId')) {
  console.log('✅ result.js 从 URL 参数获取 questionId');
}

// 4. 问题诊断
console.log('\n' + '='.repeat(60));
console.log('问题诊断');
console.log('='.repeat(60));

console.log('\n可能的 ID 格式不匹配原因:');
console.log('1. CloudBase 测试环境 vs 正式环境 ID 格式不同');
console.log('2. 前端 URL 传递时 questionId 为空');
console.log('3. vote 查询时使用了错误的集合（answers vs questions）');

console.log('\n建议修复:');
console.log('1. 在 generateReply 中记录完整的 _id');
console.log('2. 在 vote 中记录接收到的 id');
console.log('3. 确认前端 URL 中确实包含了正确的 questionId');

console.log('\n' + '='.repeat(60));
console.log('测试完成');
console.log('='.repeat(60));
