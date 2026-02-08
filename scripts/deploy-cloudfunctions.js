/**
 * 微信云函数部署脚本
 * 
 * 使用方法:
 * 1. 确保微信开发者工具已开启服务端口
 * 2. 运行: node scripts/deploy-cloudfunctions.js
 * 
 * 环境变量:
 * - WECHAT_APPID: 小程序 AppID
 * - WECHAT_PRIVATE_KEY: 微信私钥 (用于 CI/CD)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.join(__dirname, '..');
const CLOUDFUNCTIONS_DIR = path.join(PROJECT_DIR, 'cloudfunctions');

// 云函数列表
const CLOUDFUNCTIONS = [
  'generateReply',
  'vote',
  'getLeaderboard',
  'getLikeStatus',
  'getUserProfile',
  'getUserStats',
  'initDb',
  'fixQuestions'
];

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function deployCloudFunction(name) {
  log(`🚀 开始部署云函数: ${name}`);
  
  const funcPath = path.join(CLOUDFUNCTIONS_DIR, name);
  
  if (!fs.existsSync(funcPath)) {
    log(`❌ 云函数不存在: ${funcPath}`);
    return false;
  }
  
  try {
    // 安装依赖
    log(`📦 安装依赖: ${name}`);
    execSync('npm install --production', {
      cwd: funcPath,
      stdio: 'inherit'
    });
    
    // 部署云函数 (使用微信开发者工具 CLI)
    // 注意: 需要微信开发者工具开启服务端口
    log(`⬆️ 部署云函数: ${name}`);
    
    // 方法1: 使用微信开发者工具 CLI (如果可用)
    try {
      execSync(`cli deploy --name ${name} --env ${process.env.WECHAT_ENV_ID || 'doghead-advisor'}`, {
        cwd: funcPath,
        stdio: 'inherit'
      });
    } catch (e) {
      // 方法2: 使用 miniprogram-ci (需要配置)
      log(`⚠️ 微信 CLI 不可用，尝试 miniprogram-ci...`);
      execSync(`npx miniprogram-ci deploy`, {
        cwd: PROJECT_DIR,
        stdio: 'inherit'
      });
    }
    
    log(`✅ 云函数部署成功: ${name}`);
    return true;
  } catch (error) {
    log(`❌ 云函数部署失败: ${name}`);
    log(`错误: ${error.message}`);
    return false;
  }
}

function main() {
  log('🐕 狗头军师 - 云函数部署脚本');
  log('================================');
  
  // 检查云函数目录
  if (!fs.existsSync(CLOUDFUNCTIONS_DIR)) {
    log('❌ 云函数目录不存在');
    process.exit(1);
  }
  
  // 部署所有云函数
  let successCount = 0;
  let failCount = 0;
  
  for (const funcName of CLOUDFUNCTIONS) {
    if (deployCloudFunction(funcName)) {
      successCount++;
    } else {
      failCount++;
    }
    log('---');
  }
  
  log('================================');
  log(`📊 部署完成: ${successCount} 成功, ${failCount} 失败`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

main();
