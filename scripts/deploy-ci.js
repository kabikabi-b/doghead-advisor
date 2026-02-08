/**
 * miniprogram-ci 云函数部署脚本
 * 
 * 使用方法:
 *   export WECHAT_APPID=wx3ae4dfecd97351ea
 *   export WECHAT_PRIVATE_KEY_PATH=/path/to/private.key
 *   export WECHAT_PROJECT_PATH=/path/to/project
 *   node scripts/deploy-ci.js
 * 
 * 或使用环境变量文件 .env:
 *   WECHAT_APPID=wx3ae4dfecd97351ea
 *   WECHAT_PRIVATE_KEY_PATH=./private.key
 *   WECHAT_PROJECT_PATH=.
 */

const { deployAllCloudFunction } = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

// 加载环境变量
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

async function ciDeploy() {
  // 加载环境变量
  loadEnv();
  
  const { 
    WECHAT_APPID, 
    WECHAT_PRIVATE_KEY_PATH, 
    WECHAT_PROJECT_PATH,
    WECHAT_ENV_ID = 'doghead-advisor'
  } = process.env;
  
  // 验证必要参数
  if (!WECHAT_APPID) {
    console.error('❌ 缺少环境变量: WECHAT_APPID');
    console.log('');
    console.log('请设置环境变量:');
    console.log('  export WECHAT_APPID=wx3ae4dfecd97351ea');
    console.log('  export WECHAT_PRIVATE_KEY_PATH=./private.key');
    console.log('  export WECHAT_PROJECT_PATH=/path/to/project');
    process.exit(1);
  }
  
  if (!WECHAT_PRIVATE_KEY_PATH) {
    console.error('❌ 缺少环境变量: WECHAT_PRIVATE_KEY_PATH');
    process.exit(1);
  }
  
  if (!WECHAT_PROJECT_PATH) {
    console.error('❌ 缺少环境变量: WECHAT_PROJECT_PATH');
    process.exit(1);
  }
  
  // 验证私钥文件
  const privateKeyPath = path.resolve(WECHAT_PROJECT_PATH, WECHAT_PRIVATE_KEY_PATH);
  if (!fs.existsSync(privateKeyPath)) {
    console.error('❌ 私钥文件不存在:', privateKeyPath);
    console.log('');
    console.log('请下载微信私钥:');
    console.log('  1. 登录微信公众平台: https://mp.weixin.qq.com/');
    console.log('  2. 进入「开发管理」-「开发设置」');
    console.log('  3. 下载「小程序代码上传密钥」');
    console.log('  4. 将密钥文件保存为: private.key');
    process.exit(1);
  }
  
  console.log('🚀 开始 CI/CD 部署...');
  console.log('');
  console.log(`📱 AppID: ${WECHAT_APPID}`);
  console.log(`🌍 环境 ID: ${WECHAT_ENV_ID}`);
  console.log(`📁 项目路径: ${path.resolve(WECHAT_PROJECT_PATH)}`);
  console.log(`🔑 私钥路径: ${privateKeyPath}`);
  console.log('');
  
  try {
    await deployAllCloudFunction({
      appid: WECHAT_APPID,
      projectPath: path.resolve(WECHAT_PROJECT_PATH),
      privateKeyPath: privateKeyPath,
      envId: WECHAT_ENV_ID,
      onProgressUpdate: (info) => {
        const status = info.status === 'success' ? '✅' : info.status === 'fail' ? '❌' : '⏳';
        console.log(`${status} [${info.name}] ${info.status}: ${info.message || ''}`);
      }
    });
    
    console.log('');
    console.log('✅ CI/CD 部署完成！');
    console.log('');
    console.log('📝 下一步:');
    console.log('  1. 在微信开发者工具中提交审核');
    console.log('  2. 或使用 CLI 提交: npm run deploy:ci:submit');
  } catch (error) {
    console.error('');
    console.error('❌ 部署失败:', error.message);
    console.error('');
    console.error('可能的原因:');
    console.error('  1. 私钥文件无效或已过期');
    console.error('  2. AppID 与私钥不匹配');
    console.error('  3. 网络连接问题');
    console.error('  4. 云开发环境未开通或已过期');
    process.exit(1);
  }
}

ciDeploy();
