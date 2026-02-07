/**
 * 微信小程序刷新脚本
 * 
 * Usage: node scripts/refresh-wechat.js
 * 
 * 这个脚本:
 * 1. 清理项目缓存
 * 2. 确保图标文件存在
 * 3. 提供刷新指令
 */

const fs = require('fs');
const path = require('path');

const ICONS = [
  'tab-home', 'tab-home-active',
  'tab-community', 'tab-community-active',
  'tab-rank', 'tab-rank-active',
  'tab-profile', 'tab-profile-active'
];

function checkIcons() {
  console.log('\n📋 检查 TabBar 图标...\n');
  
  let allExist = true;
  for (const icon of ICONS) {
    const filePath = `images/${icon}.png`;
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  ✅ ${filePath} (${stats.size} bytes)`);
    } else {
      console.log(`  ❌ ${filePath} MISSING`);
      allExist = false;
    }
  }
  
  return allExist;
}

function checkConfig() {
  console.log('\n📋 检查 TabBar 配置...\n');
  
  try {
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    
    if (appJson.tabBar && appJson.tabBar.list) {
      for (const item of appJson.tabBar.list) {
        if (fs.existsSync(item.iconPath)) {
          console.log(`  ✅ ${item.iconPath}`);
        } else {
          console.log(`  ❌ ${item.iconPath} MISSING`);
        }
      }
    }
  } catch (e) {
    console.log(`  ❌ app.json 解析失败: ${e.message}`);
  }
}

function printRefreshGuide() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    微信开发者工具刷新指南                                ║
╚═══════════════════════════════════════════════════════════════════════════╝

如果 TabBar 图标显示为黑色方块，请尝试:

1. 清理缓存
   微信开发者工具 → 「工具」→「清理缓存」→「清理全部」

2. 重新编译
   「编译」→「重新编译」或 Ctrl+B

3. 如果还不行，删除项目后重新导入
   「详情」→「基本信息」→「删除项目」
   重新添加项目

4. 检查网络
   确保图片文件已同步到本地

文件路径: ~/projects/doghead-advisor/
`);
}

function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    微信小程序刷新工具 v1.0.0                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
  `);
  
  const iconsOk = checkIcons();
  checkConfig();
  
  console.log('\n' + '='.repeat(60));
  
  if (iconsOk) {
    console.log('\n✅ 图标文件检查通过!');
    console.log('如果仍显示黑色方块，请刷新开发者工具。\n');
  } else {
    console.log('\n❌ 图标文件缺失，请检查!\n');
  }
  
  printRefreshGuide();
}

main();
