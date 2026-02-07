#!/usr/bin/env node

/**
 * 狗狗军师一键部署脚本
 * 
 * Usage: node scripts/deploy-all.js [--env staging]
 * 
 * 注意: 云函数部署需要在微信开发者工具中手动操作
 */

const { execSync } = require('child_process');
const fs = require('fs');

const ENV_CONFIG = {
  staging: {
    envId: 'cloud1-8ge51kis0d4af40b',
    name: 'staging'
  }
};

const FUNCTIONS = [
  'generateReply',
  'getLeaderboard', 
  'vote',
  'getUserProfile',
  'initDb'
];

/**
 * 安装云函数依赖
 */
function installDependencies() {
  console.log('\n📦 安装云函数依赖...\n');
  
  for (const func of FUNCTIONS) {
    const funcPath = `cloudfunctions/${func}`;
    if (!fs.existsSync(funcPath)) continue;
    
    console.log(`  安装 ${func} 依赖...`);
    try {
      execSync('npm install', { cwd: funcPath, stdio: 'inherit' });
      console.log(`  ✅ ${func}`);
    } catch (e) {
      console.log(`  ❌ ${func} 失败: ${e.message}`);
    }
  }
}

/**
 * 打印云函数部署指南
 */
function printDeployGuide() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                         云函数部署指南                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

⚠️ 云函数需要在微信开发者工具中部署:

1. 打开微信开发者工具
2. 展开左侧「cloudfunctions」目录
3. 右键点击每个云函数，选择「上传并部署：云端安装依赖」

需要部署的云函数:
${FUNCTIONS.map(f => `  • ${f}`).join('\n')}

环境: staging (cloud1-8ge51kis0d4af40b)

部署成功后，刷新小程序即可测试「咨询狗哥」按钮。

`);
}

/**
 * 主函数
 */
function deploy() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    狗狗军师一键部署脚本 v1.0.0                          ║
╚═══════════════════════════════════════════════════════════════════════════╝
  `);

  const args = process.argv.slice(2);
  const env = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'staging';
  const envConfig = ENV_CONFIG[env] || ENV_CONFIG.staging;

  console.log(`部署环境: ${envConfig.name} (${envConfig.envId})\n`);

  // 1. 安装依赖
  installDependencies();

  // 2. 打印部署指南
  printDeployGuide();

  console.log('============================================');
  console.log('✅ 依赖安装完成，请部署云函数后测试！');
  console.log('============================================\n');
}

deploy();
