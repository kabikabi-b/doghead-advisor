/**
 * 狗狗军师问题诊断工具
 * 
 * Usage: node scripts/diagnose.js
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              狗狗军师 问题诊断工具 v1.0                      ║
╚════════════════════════════════════════════════════════════════╝
`);

const projectRoot = path.join(__dirname, '..');
const results = [];

function check(name, condition, fix) {
  const passed = condition();
  results.push({ name, passed, fix });
  console.log(`[${passed ? '✅' : '❌'}] ${name}`);
  if (!passed && fix) {
    console.log(`    修复: ${fix}`);
  }
}

console.log('\n【代码检查】\n');

// 1. Git 状态
check('Git 最新提交', () => {
  try {
    const { execSync } = require('child_process');
    const log = execSync('git log --oneline -1', { cwd: projectRoot }).toString();
    return log.includes('fix:') || log.includes('feat:');
  } catch { return false; }
}, '执行 git pull origin main');

// 2. 历史记录同步
check('首页保存到云数据库', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'pages/index/index.js'), 'utf8');
  return content.includes("db.collection('questions').add");
}, '确保 saveToHistory 函数调用数据库');

// 3. 社群问题加载
check('社群页加载问题', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'pages/community/community.js'), 'utf8');
  return content.includes("db.collection('questions')");
}, '检查 loadQuestions 函数');

// 4. 排行榜改版
check('排行榜显示问题列表', () => {
  const wxml = fs.readFileSync(path.join(projectRoot, 'pages/leaderboard/leaderboard.wxml'), 'utf8');
  return wxml.includes('questionList') && wxml.includes('question-text');
}, '检查排行榜 WXML');

// 5. 西高地图片
check('西高地脸部图片存在', () => {
  const pngDir = path.join(projectRoot, 'images/dog-avatar/png');
  return fs.existsSync(path.join(pngDir, 'westie-happy-big.png'));
}, '执行 scripts/svg-to-png.js 生成图片');

// 6. 图片引用
check('首页引用正确图片', () => {
  const wxml = fs.readFileSync(path.join(projectRoot, 'pages/index/index.wxml'), 'utf8');
  return wxml.includes('westie-happy-big.png');
}, '检查 index.wxml 图片路径');

// 7. 点赞功能
check('社群点赞函数存在', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'pages/community/community.js'), 'utf8');
  return content.includes('onVote');
}, '检查 onVote 函数');

// 8. fixQuestions 云函数
check('fixQuestions 云函数', () => {
  const funcDir = path.join(projectRoot, 'cloudfunctions/fixQuestions');
  return fs.existsSync(funcDir);
}, '运行 scripts/deploy-all.js 部署云函数');

console.log('\n【诊断结论】\n');

const passed = results.filter(r => r.passed).length;
const total = results.length;

if (passed === total) {
  console.log(`✅ 所有检查通过 (${passed}/${total})`);
  console.log('\n如果功能仍不生效，请执行:');
  console.log('1. 微信开发者工具重新导入项目');
  console.log('2. 工具 → 清理缓存 → 清理全部');
  console.log('3. 重新编译');
} else {
  console.log(`⚠️ ${total - passed} 个问题需要修复`);
}

console.log('\n【微信开发者工具操作】\n');
console.log('1. 删除项目');
console.log('2. 重新添加项目');
console.log('3. 工具 → 清理缓存 → 清理全部');
console.log('4. 编译 → 重新编译');
