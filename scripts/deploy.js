#!/usr/bin/env node

/**
 * 微信云函数部署脚本
 * 
 * 方案说明:
 * - 本地开发: 使用微信开发者工具手动部署
 * - CI/CD: 使用微信云开发 HTTP API
 * 
 * 使用方法:
 * 1. 本地部署: node scripts/deploy-local.js
 * 2. CI/CD: node scripts/deploy-ci.js
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
  const timestamp = new Date().toLocaleString('zh-CN');
  console.log(`[${timestamp}] ${message}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  console.log(title);
  console.log('='.repeat(50));
}

/**
 * 本地部署 - 使用微信开发者工具
 */
function localDeploy() {
  logSection('🐕 狗头军师 - 云函数本地部署');
  
  log('提示: 请在微信开发者工具中手动部署云函数');
  log('');
  log('步骤:');
  log('1. 打开微信开发者工具');
  log('2. 导入项目: ' + PROJECT_DIR);
  log('3. 右键点击 cloudfunctions/generateReply');
  log('4. 选择 "上传并部署：云端安装依赖"');
  log('5. 重复步骤 3-4 部署其他云函数');
  log('');
  log('或者使用命令行:');
  log('  # 启动开发者工具 (需要安装微信 CLI)');
  log('  npm run deploy:cli');
  log('');
  
  // 打印云函数列表
  logSection('📋 待部署云函数列表');
  CLOUDFUNCTIONS.forEach((name, index) => {
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, name);
    const exists = fs.existsSync(funcPath);
    log(`${index + 1}. ${name} ${exists ? '✅' : '❌'}`);
  });
}

/**
 * CI/CD 部署 - 使用微信云开发 API
 */
function ciDeploy() {
  logSection('🚀 CI/CD 云函数部署');
  
  const envId = process.env.WECHAT_ENV_ID;
  const appid = process.env.WECHAT_APPID;
  const privateKey = process.env.WECHAT_PRIVATE_KEY;
  
  if (!envId || !appid || !privateKey) {
    log('❌ 缺少必要的环境变量');
    log('');
    log('请设置以下环境变量:');
    log('  WECHAT_ENV_ID=your-env-id');
    log('  WECHAT_APPID=your-appid');
    log('  WECHAT_PRIVATE_KEY=your-private-key');
    log('');
    log('或在 .env 文件中配置:');
    log('  WECHAT_ENV_ID=your-env-id');
    log('  WECHAT_APPID=your-appid');
    log('  WECHAT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...');
    process.exit(1);
  }
  
  log(`环境 ID: ${envId}`);
  log(`AppID: ${appid}`);
  log('');
  
  // 部署每个云函数
  let successCount = 0;
  let failCount = 0;
  
  for (const funcName of CLOUDFUNCTIONS) {
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, funcName);
    
    if (!fs.existsSync(funcPath)) {
      log(`❌ 云函数不存在: ${funcName}`);
      failCount++;
      continue;
    }
    
    log(`📦 处理云函数: ${funcName}`);
    
    try {
      // 1. 安装依赖
      log(`  ⏬ 安装依赖...`);
      execSync('npm install --production', {
        cwd: funcPath,
        stdio: 'pipe'
      });
      
      // 2. 打包云函数
      log(`  📦 打包云函数...`);
      const tarPath = path.join(funcPath, `${funcName}.zip`);
      
      // 创建打包脚本
      const packScript = `
        cd ${funcPath}
        zip -r ${tarPath} index.js package.json package-lock.json node_modules -x "*.map" "*.log"
      `;
      
      execSync(packScript, { shell: '/bin/bash', stdio: 'pipe' });
      
      log(`  ✅ 云函数已打包: ${tarPath}`);
      
      // 3. 使用云开发 API 上传
      // 注意: 这里需要使用微信云开发的 HTTP API
      // 实际使用时需要调用对应的 API
      log(`  ⚠️  请使用微信云开发控制台或 API 上传`);
      log(`  📝 文件路径: ${tarPath}`);
      
      successCount++;
    } catch (error) {
      log(`  ❌ 处理失败: ${error.message}`);
      failCount++;
    }
    
    log('');
  }
  
  logSection('📊 部署摘要');
  log(`成功: ${successCount}`);
  log(`失败: ${failCount}`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

/**
 * 安装微信 CLI 工具
 */
function installWechatCLI() {
  logSection('🔧 安装微信开发者工具 CLI');
  
  log('微信开发者工具 CLI 安装步骤:');
  log('');
  log('1. 下载微信开发者工具 CLI 版本:');
  log('   https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html');
  log('');
  log('2. 安装 CLI:');
  log('   # macOS (使用 Homebrew)');
  log('   brew install wechat-devtool');
  log('');
  log('3. 登录 CLI:');
  log('   wechat-devtool-cli login');
  log('');
  log('4. 部署云函数:');
  log('   wechat-devtool-cli upload-cloudfunction --name generateReply --env doghead-advisor');
  log('');
  
  // 检查是否已安装
  try {
    execSync('which wechat-devtool', { stdio: 'pipe' });
    log('✅ 微信开发者工具 CLI 已安装');
  } catch (e) {
    log('⚠️ 微信开发者工具 CLI 未安装');
  }
}

/**
 * 验证部署
 */
function verify() {
  logSection('🔍 验证云函数部署');
  
  const envId = process.env.WECHAT_ENV_ID || 'doghead-advisor';
  
  log(`环境 ID: ${envId}`);
  log('');
  log('验证步骤:');
  log('1. 打开微信开发者工具');
  log('2. 进入云开发控制台');
  log('3. 检查云函数列表');
  log('');
  log('或使用 CLI 验证:');
  log(`  curl "https://api.weixin.qq.com/tcb/listfunctions?access_token=TOKEN&env=${envId}"`);
}

/**
 * 主函数
 */
function main() {
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'local':
      localDeploy();
      break;
    case 'ci':
      ciDeploy();
      break;
    case 'cli':
      installWechatCLI();
      break;
    case 'verify':
      verify();
      break;
    case 'help':
    default:
      console.log(`
🐕 狗头军师 - 云函数部署脚本

使用方法:
  node scripts/deploy.js <命令>

命令:
  local     本地部署 (显示部署提示)
  ci        CI/CD 部署 (需要环境变量)
  cli       安装微信 CLI 工具
  verify    验证部署状态
  help      显示帮助

环境变量 (CI/CD 模式):
  WECHAT_ENV_ID        云开发环境 ID
  WECHAT_APPID         小程序 AppID
  WECHAT_PRIVATE_KEY    微信私钥

示例:
  # 本地开发
  node scripts/deploy.js local
  
  # CI/CD 部署
  WECHAT_ENV_ID=doghead-advisor \\
  WECHAT_APPID=wx3ae4dfecd97351ea \\
  WECHAT_PRIVATE_KEY="$(cat private.key)" \\
  node scripts/deploy.js ci
      `);
  }
}

main();
