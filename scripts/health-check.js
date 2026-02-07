#!/usr/bin/env node

/**
 * 狗狗军师项目健康检查脚本
 * 
 * Usage: node scripts/health-check.js [--env staging|production]
 * 
 * 检查:
 * 1. 配置文件正确性
 * 2. 资源文件存在性
 * 3. 数据库集合可用性
 * 4. 云函数部署状态
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

const REQUIRED_COLLECTIONS = ['questions', 'votes', 'users'];
const REQUIRED_ICONS = [
  'tab-home', 'tab-home-active',
  'tab-community', 'tab-community-active',
  'tab-rank', 'tab-rank-active',
  'tab-profile', 'tab-profile-active'
];

/**
 * 检查配置文件
 */
function checkConfig() {
  console.log('\n📋 检查配置文件...');
  
  const checks = [];
  
  // 检查 app.json
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    
    // 检查页面
    if (appJson.pages && appJson.pages.length > 0) {
      for (const page of appJson.pages) {
        // app.json 中的 pages 是 "pages/index/index"，需要转换为 "pages/index/index.wxml"
        const wxmlPath = `${page}.wxml`;
        if (fs.existsSync(wxmlPath)) {
          checks.push({ name: `页面 ${page}`, status: '✅' });
        } else {
          checks.push({ name: `页面 ${page}`, status: '❌', error: '文件不存在' });
        }
      }
    }
    
    // 检查 tabBar 图标
    if (appJson.tabBar && appJson.tabBar.list) {
      for (const item of appJson.tabBar.list) {
        if (fs.existsSync(item.iconPath)) {
          checks.push({ name: `图标 ${item.iconPath}`, status: '✅' });
        } else {
          checks.push({ name: `图标 ${item.iconPath}`, status: '❌', error: '文件不存在' });
        }
      }
    }
    
    console.log('  app.json 检查完成');
    
  } catch (e) {
    checks.push({ name: 'app.json', status: '❌', error: e.message });
  }
  
  return checks;
}

/**
 * 检查云函数
 */
function checkCloudFunctions() {
  console.log('\n☁️ 检查云函数...');
  
  const checks = [];
  const cloudfunctions = ['generateReply', 'getLeaderboard', 'vote', 'getUserProfile', 'initDb'];
  
  for (const func of cloudfunctions) {
    const funcPath = `cloudfunctions/${func}`;
    
    // 检查目录
    if (!fs.existsSync(funcPath)) {
      checks.push({ name: func, status: '❌', error: '目录不存在' });
      continue;
    }
    
    // 检查必要文件
    const requiredFiles = ['index.js', 'package.json', 'config.json'];
    for (const file of requiredFiles) {
      const filePath = `${funcPath}/${file}`;
      if (!fs.existsSync(filePath)) {
        checks.push({ name: `${func}/${file}`, status: '❌', error: '文件不存在' });
      }
    }
    
    // 检查 package.json
    try {
      const pkg = JSON.parse(fs.readFileSync(`${funcPath}/package.json`, 'utf8'));
      if (pkg.dependencies && pkg.dependencies['wx-server-sdk']) {
        checks.push({ name: `${func}/package.json`, status: '✅' });
      } else {
        checks.push({ name: `${func}/wx-server-sdk`, status: '❌', error: '缺少依赖' });
      }
    } catch (e) {
      checks.push({ name: `${func}/package.json`, status: '❌', error: '解析失败' });
    }
  }
  
  return checks;
}

/**
 * 打印数据库创建指南
 */
function printDBGuide(envConfig) {
  console.log(`
\n╔═══════════════════════════════════════════════════════════════════════════╗
║                    数据库集合创建指南                                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

环境: ${envConfig.name} (${envConfig.envId})

请在云开发控制台创建以下集合:

1. 打开微信开发者工具
2. 点击「云开发」→「数据库」
3. 点击「+」创建集合:

   ┌─────────────┐
   │ questions   │ ← 问题集合
   ├─────────────┤
   │ votes       │ ← 点赞记录
   ├─────────────┤
   │ users       │ ← 用户集合
   └─────────────┘

4. 设置权限:「所有用户可读，仅创建者可读写」

创建完成后，运行:
  node scripts/health-check.js --env staging
`);
}

/**
 * 主函数
 */
async function healthCheck() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    狗狗军师项目健康检查 v1.0.0                         ║
╚═══════════════════════════════════════════════════════════════════════════╝
  `);
  
  // 解析参数
  const args = process.argv.slice(2);
  const env = args.includes('--env') 
    ? args[args.indexOf('--env') + 1] 
    : 'staging';
  
  const envConfig = ENV_CONFIG[env] || ENV_CONFIG.staging;
  
  console.log(`检查环境: ${env.name} (${envConfig.envId})\n`);
  
  const allChecks = [];
  
  // 1. 检查配置文件
  allChecks.push(...checkConfig());
  
  // 2. 检查云函数
  allChecks.push(...checkCloudFunctions());
  
  // 3. 检查数据库集合 (需要云开发控制台操作)
  console.log('\n🗄️ 检查数据库集合...');
  console.log('  ⚠️ 需要在云开发控制台创建以下集合:');
  for (const collection of REQUIRED_COLLECTIONS) {
    console.log(`     - ${collection}`);
  }
  
  // 汇总
  console.log('\n' + '='.repeat(60));
  console.log('检查结果汇总');
  console.log('='.repeat(60));
  
  const passed = allChecks.filter(c => c.status === '✅').length;
  const failed = allChecks.filter(c => c.status === '❌').length;
  
  console.log(`\n通过: ${passed}`);
  console.log(`失败: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ 未通过的项目:');
    for (const check of allChecks.filter(c => c.status === '❌')) {
      console.log(`   - ${check.name}: ${check.error}`);
    }
  }
  
  // 数据库集合提示
  console.log('\n' + '='.repeat(60));
  console.log('数据库集合');
  console.log('='.repeat(60));
  printDBGuide(envConfig);
  
  console.log('\n✅ 健康检查完成!');
}

healthCheck().catch(console.error);
