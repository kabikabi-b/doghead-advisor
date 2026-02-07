/**
 * 狗狗军师按钮功能测试脚本
 * 
 * Usage: node tests/button-test.js
 * 
 * 注意: 这个脚本检查代码逻辑，实际测试需要在微信开发者工具中进行
 */

const fs = require('fs');

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    狗狗军师按钮功能测试                               ║
╚═══════════════════════════════════════════════════════════════════════╝
`);

// 测试 1: 首页按钮 disabled 条件
function testHomeButton() {
  console.log('\n【测试 1】首页「咨询狗哥」按钮');
  console.log('='.repeat(50));
  
  const wxml = fs.readFileSync('pages/index/index.wxml', 'utf8');
  const js = fs.readFileSync('pages/index/index.js', 'utf8');
  const wxss = fs.readFileSync('pages/index/index.wxss', 'utf8');
  
  const tests = [
    {
      name: '按钮有 bindtap 事件',
      pass: wxml.includes('bindtap="onGenerateTap"')
    },
    {
      name: 'disabled 条件正确 (loading)',
      pass: wxml.includes('disabled="{{loading}}"')
    },
    {
      name: 'loading 初始值为 false',
      pass: js.includes('loading: false')
    },
    {
      name: 'onGenerateTap 调用云函数',
      pass: js.includes('wx.cloud.callFunction') && js.includes("name: 'generateReply'")
    },
    {
      name: '云函数成功时跳转结果页',
      pass: js.includes('navigateTo') && js.includes('result?')
    },
    {
      name: 'loading 在成功/失败时重置',
      pass: js.includes('this.setData({ loading: false })')
    },
    {
      name: '按钮样式存在',
      pass: wxss.includes('.generate-btn')
    }
  ];
  
  let allPass = true;
  tests.forEach(t => {
    console.log(`  ${t.pass ? '✅' : '❌'} ${t.name}`);
    if (!t.pass) allPass = false;
  });
  
  return allPass;
}

// 测试 2: 社群页初始化按钮
function testCommunityButton() {
  console.log('\n【测试 2】社群页「立即初始化」按钮');
  console.log('='.repeat(50));
  
  const wxml = fs.readFileSync('pages/community/community.wxml', 'utf8');
  const js = fs.readFileSync('pages/community/community.js', 'utf8');
  
  const tests = [
    {
      name: '按钮有 bindtap 事件',
      pass: wxml.includes('bindtap="initDatabase"')
    },
    {
      name: 'initDatabase 函数存在',
      pass: js.includes('async initDatabase()')
    },
    {
      name: '调用 db.initDatabase()',
      pass: js.includes('db.initDatabase()')
    },
    {
      name: '初始化成功后重置 collectionError',
      pass: js.includes('collectionError: false')
    },
    {
      name: '加载问题函数存在',
      pass: js.includes('loadQuestions()')
    }
  ];
  
  let allPass = true;
  tests.forEach(t => {
    console.log(`  ${t.pass ? '✅' : '❌'} ${t.name}`);
    if (!t.pass) allPass = false;
  });
  
  return allPass;
}

// 测试 3: 结果页按钮
function testResultButtons() {
  console.log('\n【测试 3】结果页按钮');
  console.log('='.repeat(50));
  
  const wxml = fs.readFileSync('pages/result/result.wxml', 'utf8');
  const js = fs.readFileSync('pages/result/result.js', 'utf8');
  
  const tests = [
    {
      name: '返回按钮 (onBackTap)',
      pass: wxml.includes('bindtap="onBackTap"') && js.includes('onBackTap')
    },
    {
      name: '复制按钮 (onCopyTap)',
      pass: wxml.includes('bindtap="onCopyTap"') && js.includes('onCopyTap')
    },
    {
      name: '点赞按钮 (onLikeTap)',
      pass: wxml.includes('bindtap="onLikeTap"') && js.includes('onLikeTap')
    },
    {
      name: '再问一个 (onAskAgainTap)',
      pass: wxml.includes('bindtap="onAskAgainTap"') && js.includes('onAskAgainTap')
    }
  ];
  
  let allPass = true;
  tests.forEach(t => {
    console.log(`  ${t.pass ? '✅' : '❌'} ${t.name}`);
    if (!t.pass) allPass = false;
  });
  
  return allPass;
}

// 运行测试
const results = [
  testHomeButton(),
  testCommunityButton(),
  testResultButtons()
];

console.log('\n' + '='.repeat(60));
console.log(`测试结果: ${results.every(r => r) ? '✅ 全部通过' : '❌ 有失败项'}`);
console.log('='.repeat(60));

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    微信开发者工具实际测试                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

请在微信开发者工具中执行以下测试:

1. 首页测试
   - 输入问题: "今天运气怎么样？"
   - 点击「🐕 咨询狗哥」按钮
   - 预期: 显示 loading → 生成回复 → 跳转结果页

2. 社群页测试
   - 进入「社群」页
   - 点击「📋 立即初始化」按钮
   - 预期: 显示 loading → 初始化成功

3. 结果页测试
   - 点击「📋 一键复制」
   - 点击「👍 点赞」
   - 点击「🔄 再问一个」
`);

process.exit(results.every(r => r) ? 0 : 1);
