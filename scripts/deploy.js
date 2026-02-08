#!/usr/bin/env node

/**
 * 微信云函数部署脚本
 * 
 * 方案说明:
 * - 本地开发: 使用微信开发者工具手动部署
 * - CI/CD: 使用 miniprogram-ci 自动化部署
 * 
 * 使用方法:
 *   node scripts/deploy.js <命令>
 * 
 * 命令:
 *   local     本地部署 (显示部署提示)
 *   ci        CI/CD 部署 (需要环境变量)
 *   cli       安装微信 CLI 工具
 *   verify    验证部署状态
 *   help      显示帮助
 * 
 * 环境变量 (CI/CD 模式):
 *   WECHAT_ENV_ID        云开发环境 ID
 *   WECHAT_APPID         小程序 AppID
 *   WECHAT_PRIVATE_KEY_PATH  微信私钥路径
 * 
 * 示例:
 *   # 本地开发 - 显示部署提示
 *   node scripts/deploy.js local
 *   
 *   # CI/CD - 需要先配置环境变量
 *   export WECHAT_ENV_ID=doghead-advisor
 *   export WECHAT_APPID=wx3ae4dfecd97351ea
 *   export WECHAT_PRIVATE_KEY_PATH=./private.key
 *   node scripts/deploy.js ci
 *   
 *   # 使用 npm 脚本
 *   npm run deploy:local
 *   npm run deploy:ci
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
  log(`2. 导入项目: ${PROJECT_DIR}`);
  log('3. 右键点击 cloudfunctions/generateReply');
  log('4. 选择 "上传并部署：云端安装依赖"');
  log('5. 重复步骤 3-4 部署其他云函数');
  log('');
  log('或者使用命令行:');
  log('  # 启动开发者工具');
  log('  npm run deploy:cli && npm run deploy:login');
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
 * CI/CD 部署 - 使用 miniprogram-ci
 */
function ciDeploy() {
  logSection('🚀 CI/CD 云函数部署');
  
  const envId = process.env.WECHAT_ENV_ID || 'doghead-advisor';
  const appid = process.env.WECHAT_APPID;
  const privateKeyPath = process.env.WECHAT_PRIVATE_KEY_PATH;
  const projectPath = process.env.WECHAT_PROJECT_PATH || PROJECT_DIR;
  
  if (!appid || !privateKeyPath) {
    log('❌ 缺少必要的环境变量');
    log('');
    log('请设置以下环境变量:');
    log('  WECHAT_ENV_ID=your-env-id');
    log('  WECHAT_APPID=your-appid');
    log('  WECHAT_PRIVATE_KEY_PATH=./private.key');
    log('');
    log('或在 .env 文件中配置 (复制 .env.example 为 .env):');
    log('');
    log('示例 .env 文件:');
    log('  WECHAT_ENV_ID=doghead-advisor');
    log('  WECHAT_APPID=wx3ae4dfecd97351ea');
    log('  WECHAT_PRIVATE_KEY_PATH=./private.key');
    log('  WECHAT_PROJECT_PATH=.');
    process.exit(1);
  }
  
  log(`环境 ID: ${envId}`);
  log(`AppID: ${appid}`);
  log(`项目路径: ${projectPath}`);
  log(`私钥路径: ${privateKeyPath}`);
  log('');
  
  // 验证私钥文件
  const fullKeyPath = path.resolve(projectPath, privateKeyPath);
  if (!fs.existsSync(fullKeyPath)) {
    log(`❌ 私钥文件不存在: ${fullKeyPath}`);
    log('');
    log('请从微信公众平台下载私钥:');
    log('  1. 登录 https://mp.weixin.qq.com/');
    log('  2. 进入「开发管理」-「开发设置」');
    log('  3. 下载「小程序代码上传密钥」');
    log('  4. 将密钥文件保存到项目根目录');
    process.exit(1);
  }
  
  log('✅ 私钥文件存在');
  log('');
  
  // 调用 CI 部署脚本
  const ciScript = path.join(__dirname, 'deploy-ci.js');
  if (fs.existsSync(ciScript)) {
    try {
      require('./deploy-ci');
    } catch (error) {
      log(`❌ CI 部署失败: ${error.message}`);
      process.exit(1);
    }
  } else {
    log('⚠️ CI 部署脚本不存在，请先运行: npm install');
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
  WECHAT_ENV_ID           云开发环境 ID
  WECHAT_APPID            小程序 AppID
  WECHAT_PRIVATE_KEY_PATH 微信私钥路径

npm 脚本:
  npm run deploy          显示帮助
  npm run deploy:local    本地部署
  npm run deploy:ci       CI/CD 部署
  npm run deploy:cli      安装 CLI
  npm run deploy:login    登录

示例:
  # 本地开发
  npm run deploy:local
  
  # CI/CD 部署
  WECHAT_ENV_ID=doghead-advisor \\
  WECHAT_APPID=wx3ae4dfecd97351ea \\
  WECHAT_PRIVATE_KEY_PATH=./private.key \\
  npm run deploy:ci
      `);
  }
}

main();
