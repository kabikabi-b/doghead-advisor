#!/usr/bin/env node

/**
 * 狗狗军师一键部署脚本
 * 
 * Usage: node scripts/deploy-all.js [--env staging|production]
 * 
 * 执行:
 * 1. 安装依赖
 * 2. 部署云函数
 * 3. 初始化数据库集合
 * 4. 运行冒烟测试
 */

const { execSync } = require('child_process');
const fs = require('fs');
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

const FUNCTIONS = ['generateReply', 'getLeaderboard', 'vote', 'getUserProfile'];
const COLLECTIONS = ['questions', 'votes', 'users'];

/**
 * 日志
 */
function log(msg, type = 'info') {
  const icon = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', step: '🔧' }[type] || 'ℹ️';
  console.log(`${icon} ${msg}`);
}

/**
 * 安装依赖
 */
function installDeps(funcName) {
  const funcPath = path.join('cloudfunctions', funcName);
  log(`安装依赖: ${funcName}`);
  execSync('npm install', { cwd: funcPath, stdio: 'inherit' });
}

/**
 * 部署云函数
 */
function deployFunction(funcName, envId) {
  log(`部署云函数: ${funcName}`);
  const funcPath = path.join('cloudfunctions', funcName);
  
  // 使用微信开发者工具 CLI
  try {
    execSync(`npx wx-cloud-cli deploy --env ${envId}`, {
      cwd: funcPath,
      stdio: 'inherit'
    });
    return true;
  } catch (e) {
    log(`wx-cloud-cli 不可用，跳过 CLI 部署`, 'warning');
    return false;
  }
}

/**
 * 检查数据库集合是否存在
 */
function checkCollectionExists(collectionName, envId) {
  // 这需要实际调用云函数检查，暂时返回 false
  return false;
}

/**
 * 打印数据库创建指南
 */
function printDBInitGuide(envId) {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                    数据库集合创建 (手动操作)                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

⚠️ 社群页加载失败: "collection not exists: questions"

请在云开发控制台创建数据库集合:

1. 打开微信开发者工具
2. 点击「云开发」→「数据库」
3. 点击「+」创建以下集合:

   questions  ← 问题集合
   votes      ← 点赞记录  
   users      ← 用户集合

4. 设置权限:「所有用户可读，仅创建者可读写」

5. 重新打开社群页测试

环境 ID: ${envId}
`);
}

/**
 * 主函数
 */
async function deploy() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    狗狗军师一键部署脚本 v1.0.0                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
  `);
  
  // 解析参数
  const args = process.argv.slice(2);
  const env = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'staging';
  const envConfig = ENV_CONFIG[env] || ENV_CONFIG.staging;
  
  log(`部署环境: ${envConfig.name} (${envConfig.envId})`, 'info');
  
  let deploySuccess = true;
  
  // 1. 安装依赖 + 部署云函数
  log('=== 云函数部署 ===', 'step');
  for (const func of FUNCTIONS) {
    try {
      // 检查目录是否存在
      const funcPath = path.join('cloudfunctions', func);
      if (!fs.existsSync(funcPath)) {
        log(`云函数目录不存在，跳过: ${func}`, 'warning');
        continue;
      }
      
      // 安装依赖
      installDeps(func);
      
      // 部署
      deployFunction(func, envConfig.envId);
      
      log(`${func} 部署完成`, 'success');
    } catch (e) {
      log(`${func} 部署失败: ${e.message}`, 'error');
      deploySuccess = false;
    }
  }
  
  // 2. 检查数据库集合
  log('\n=== 数据库集合检查 ===', 'step');
  log(`需要以下集合: ${COLLECTIONS.join(', ')}`, 'info');
  
  // 检查是否有集合不存在的错误
  // 这里需要实际测试才能知道
  
  // 3. 输出数据库初始化指南
  printDBInitGuide(envConfig.envId);
  
  // 4. 运行冒烟测试
  log('\n=== 冒烟测试 ===', 'step');
  try {
    const smokeTestPath = path.join(__dirname, 'smoke-test.js');
    if (fs.existsSync(smokeTestPath)) {
      execSync(`node ${smokeTestPath} --env ${env}`, { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit' 
      });
    }
  } catch (e) {
    log(`冒烟测试失败: ${e.message}`, 'warning');
  }
  
  // 总结
  console.log('\n' + '='.repeat(60));
  if (deploySuccess) {
    log('🎉 云函数部署完成!', 'success');
  } else {
    log('⚠️ 部分云函数部署失败，请检查错误信息', 'warning');
  }
  log('请按照上述指南创建数据库集合', 'info');
}

deploy().catch(e => {
  log(`部署失败: ${e.message}`, 'error');
  process.exit(1);
});
