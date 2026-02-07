#!/usr/bin/env node

/**
 * 狗狗军师数据库集合初始化脚本
 * 
 * Usage: node scripts/init-db.js [--env staging|production]
 * 
 * 需要先安装微信云开发 CLI:
 * npm install -g @cloudbase/cli
 */

const { execSync } = require('child_process');
const path = require('path');

const ENV_CONFIG = {
  staging: {
    envId: 'cloud1-8ge51kis0d4af40b',
    name: 'staging'
  },
  production: {
    envId: 'prod-env-id',
    name: 'production'
  }
};

const COLLECTIONS = [
  {
    name: 'questions',
    schema: {
      bsonType: 'object',
      required: ['question', 'reply', 'createTime', 'openid'],
      properties: {
        question: { bsonType: 'string', description: '问题内容' },
        reply: { bsonType: 'string', description: 'AI 回复' },
        likes: { bsonType: 'int', description: '点赞数' },
        createTime: { bsonType: 'date', description: '创建时间' },
        openid: { bsonType: 'string', description: '用户 openid' }
      }
    },
    indexes: [
      { name: 'createTime', orderBy: { createTime: -1 } },
      { name: 'likes', orderBy: { likes: -1 } }
    ]
  },
  {
    name: 'votes',
    schema: {
      bsonType: 'object',
      required: ['type', 'targetId', 'openid'],
      properties: {
        type: { bsonType: 'string', description: '类型: question/reply' },
        targetId: { bsonType: 'string', description: '目标 ID' },
        openid: { bsonType: 'string', description: '用户 openid' },
        createTime: { bsonType: 'date', description: '创建时间' }
      }
    },
    indexes: [
      { name: 'target', fields: ['type', 'targetId'] },
      { name: 'user', fields: ['openid'] }
    ]
  },
  {
    name: 'users',
    schema: {
      bsonType: 'object',
      required: ['openid'],
      properties: {
        openid: { bsonType: 'string', description: '用户 openid' },
        nickName: { bsonType: 'string', description: '昵称' },
        avatarUrl: { bsonType: 'string', description: '头像' },
        stats: { 
          bsonType: 'object',
          properties: {
            totalQuestions: { bsonType: 'int' },
            totalLikes: { bsonType: 'int' },
            guguRate: { bsonType: 'int' }
          }
        },
        createTime: { bsonType: 'date', description: '创建时间' }
      }
    },
    indexes: [
      { name: 'openid', unique: true },
      { name: 'totalLikes', orderBy: { 'stats.totalLikes': -1 } }
    ]
  }
];

/**
 * 使用云开发控制台 API 创建集合
 * 注意: 完整实现需要云开发 CLI 或控制台操作
 */
function createCollectionViaCLI(collection, envConfig) {
  console.log(`创建集合: ${collection.name}`);
  
  // 方法 1: 使用 tcb CLI (如果已安装)
  try {
    execSync(`tcb collection create ${collection.name} --env ${envConfig.envId}`, {
      stdio: 'inherit'
    });
    return true;
  } catch (e) {
    console.log(`  tcb CLI 不可用，尝试其他方法...`);
  }
  
  // 方法 2: 打印手动创建指南
  console.log(`\n⚠️ 需要在云开发控制台手动创建:`);
  console.log(`   环境: ${envConfig.name} (${envConfig.envId})`);
  console.log(`   集合名: ${collection.name}`);
  console.log(`   操作: 云开发控制台 → 数据库 → 创建集合\n`);
  
  return false;
}

/**
 * 打印手动创建指南
 */
function printManualGuide(envConfig) {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║       狗狗军师数据库集合创建指南 (手动操作)                        ║
╚═══════════════════════════════════════════════════════════════════╝

1. 打开微信开发者工具
2. 点击「云开发」
3. 点击「数据库」
4. 创建以下集合 (点击「+」按钮):

   ┌─────────────┐
   │ questions   │ ← 问题集合
   ├─────────────┤
   │ votes       │ ← 点赞记录
   ├─────────────┤
   │ users       │ ← 用户集合
   └─────────────┘

5. 设置集合权限为「所有用户可读，仅创建者可读写」

环境: ${envConfig.name} (${envConfig.envId})

创建完成后，社群页即可正常加载。
`);
}

/**
 * 主函数
 */
async function init() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║       狗狗军师数据库集合初始化脚本 v1.0.0                       ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
  
  // 解析参数
  const args = process.argv.slice(2);
  const env = args.includes('--env') 
    ? args[args.indexOf('--env') + 1] 
    : 'staging';
  
  const envConfig = ENV_CONFIG[env] || ENV_CONFIG.staging;
  
  console.log(`环境: ${env.name} (${envConfig.envId})`);
  console.log(`需要创建的集合: ${COLLECTIONS.length}\n`);
  
  // 检查是否有 tcb CLI
  let hasTCBCLI = false;
  try {
    execSync('which tcb', { stdio: 'pipe' });
    hasTCBCLI = true;
  } catch (e) {
    hasTCBCLI = false;
  }
  
  if (!hasTCBCLI) {
    printManualGuide(envConfig);
    return;
  }
  
  // 创建每个集合
  for (const collection of COLLECTIONS) {
    createCollectionViaCLI(collection, envConfig);
  }
  
  console.log('\n✅ 数据库集合创建完成!');
}

init().catch(console.error);
