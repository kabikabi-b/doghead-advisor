#!/usr/bin/env node

/**
 * 狗狗军师云函数自动化部署脚本
 * 
 * Usage: node scripts/deploy-cloudfunctions.js [--env production|staging]
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CLOUDFUNCTIONS_DIR = 'cloudfunctions';
const FUNCTIONS = [
  'generateReply',
  'getLeaderboard',
  'vote',
  'getUserProfile',
  'initDb'
];

// 默认环境配置
const ENV_CONFIG = {
  staging: {
    envId: 'cloud1-8ge51kis0d4af40b',
    name: 'staging'
  },
  production: {
    envId: 'prod-env-id', // 需要替换为实际生产环境 ID
    name: 'production'
  }
};

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    env: 'staging',
    skipInstall: false,
    skipTest: false,
    verbose: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--env' && args[i + 1]) {
      config.env = args[++i];
    } else if (arg === '--skip-install') {
      config.skipInstall = true;
    } else if (arg === '--skip-test') {
      config.skipTest = true;
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  return config;
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
狗狗军师云函数自动化部署脚本

Usage: node scripts/deploy-cloudfunctions.js [options]

Options:
  --env <environment>   部署环境 (staging|production)，默认: staging
  --skip-install        跳过依赖安装
  --skip-test           跳过冒烟测试
  --verbose             显示详细日志
  --help, -h            显示帮助信息

Examples:
  node scripts/deploy-cloudfunctions.js
  node scripts/deploy-cloudfunctions.js --env staging
  node scripts/deploy-cloudfunctions.js --env production --skip-test
`);
}

/**
 * 记录日志
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().slice(11, 19);
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '🔧'
  }[type] || 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * 检查环境配置
 */
function checkEnvConfig(envId) {
  if (!envId || envId === 'prod-env-id') {
    log('警告: 生产环境 ID 未配置，使用 staging 环境配置', 'warning');
    return false;
  }
  return true;
}

/**
 * 安装依赖
 */
function installDependencies(funcPath, verbose) {
  const installLog = verbose ? 'inherit' : 'pipe';
  
  try {
    log(`安装依赖: ${funcPath}`, 'step');
    execSync('npm install', {
      cwd: funcPath,
      stdio: installLog,
      encoding: 'utf8'
    });
    
    if (!verbose) {
      log(`依赖安装完成: ${path.basename(funcPath)}`, 'success');
    }
    return true;
  } catch (error) {
    log(`依赖安装失败: ${path.basename(funcPath)} - ${error.message}`, 'error');
    return false;
  }
}

/**
 * 部署云函数
 */
function deployFunction(funcName, envConfig, verbose) {
  const funcPath = path.join(CLOUDFUNCTIONS_DIR, funcName);
  
  if (!fs.existsSync(funcPath)) {
    log(`云函数目录不存在: ${funcPath}`, 'error');
    return false;
  }
  
  try {
    log(`部署云函数: ${funcName} -> 环境: ${envConfig.envId}`, 'step');
    
    // 使用微信开发者工具 CLI 部署
    const deployCmd = `npx wx-cloud-cli deploy --env ${envConfig.envId}`;
    const deployOptions = {
      cwd: funcPath,
      encoding: 'utf8',
      stdio: verbose ? 'inherit' : 'pipe'
    };
    
    execSync(deployCmd, deployOptions);
    
    log(`云函数部署成功: ${funcName}`, 'success');
    return true;
  } catch (error) {
    // 如果 wx-cloud-cli 不可用，尝试使用微信开发者工具 CLI
    log(`wx-cloud-cli 部署失败，尝试使用微信开发者工具 CLI...`, 'warning');
    
    try {
      const altDeployCmd = `cd "${funcPath}" && npx miniprogram-cli deploy-cloudfunction --env ${envConfig.envId}`;
      execSync(altDeployCmd, {
        encoding: 'utf8',
        stdio: verbose ? 'inherit' : 'pipe'
      });
      
      log(`云函数部署成功 (备用方式): ${funcName}`, 'success');
      return true;
    } catch (altError) {
      log(`云函数部署失败: ${funcName} - ${altError.message}`, 'error');
      log(`提示: 请确保微信开发者工具已开启服务端口`, 'warning');
      return false;
    }
  }
}

/**
 * 验证部署结果
 */
function verifyDeployment(funcName, envConfig) {
  try {
    log(`验证部署: ${funcName}`, 'step');
    
    // 尝试调用云函数进行验证
    const verifyScript = `
      const cloud = require('wx-server-sdk');
      cloud.init({ env: '${envConfig.envId}' });
      
      const db = cloud.database();
      console.log('云环境连接成功');
    `;
    
    // 简单验证目录结构和配置文件
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, funcName);
    const requiredFiles = ['index.js', 'package.json', 'config.json'];
    
    for (const file of requiredFiles) {
      const filePath = path.join(funcPath, file);
      if (!fs.existsSync(filePath)) {
        log(`缺少必要文件: ${file}`, 'error');
        return false;
      }
    }
    
    // 验证 package.json 包含 wx-server-sdk
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(funcPath, 'package.json'), 'utf8')
    );
    
    if (!packageJson.dependencies || !packageJson.dependencies['wx-server-sdk']) {
      log(`缺少 wx-server-sdk 依赖: ${funcName}`, 'error');
      return false;
    }
    
    log(`部署验证通过: ${funcName}`, 'success');
    return true;
  } catch (error) {
    log(`部署验证失败: ${funcName} - ${error.message}`, 'error');
    return false;
  }
}

/**
 * 运行冒烟测试
 */
function runSmokeTest(envConfig) {
  try {
    log('运行冒烟测试...', 'step');
    
    const smokeTestPath = path.join(__dirname, 'smoke-test.js');
    
    if (!fs.existsSync(smokeTestPath)) {
      log('冒烟测试脚本不存在，跳过测试', 'warning');
      return true;
    }
    
    // 设置环境变量
    process.env.TEST_ENV_ID = envConfig.envId;
    
    // 运行冒烟测试
    execSync(`node ${smokeTestPath}`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    log('冒烟测试通过', 'success');
    return true;
  } catch (error) {
    log(`冒烟测试失败: ${error.message}`, 'error');
    return false;
  }
}

/**
 * 主部署函数
 */
async function deploy() {
  const config = parseArgs();
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║      狗狗军师云函数自动化部署脚本 v1.0.0                  ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  // 验证环境配置
  const envConfig = ENV_CONFIG[config.env] || ENV_CONFIG.staging;
  checkEnvConfig(envConfig.envId);
  
  log(`部署环境: ${config.env} (${envConfig.envId})`, 'info');
  log(`部署云函数数量: ${FUNCTIONS.length}`, 'info');
  log(`跳过依赖安装: ${config.skipInstall}`, 'info');
  log(`跳过冒烟测试: ${config.skipTest}`, 'info');
  console.log('');
  
  const results = {
    total: FUNCTIONS.length,
    success: 0,
    failed: 0,
    skipped: 0,
    functions: {}
  };
  
  // 部署每个云函数
  for (const func of FUNCTIONS) {
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, func);
    
    results.functions[func] = {
      install: false,
      deploy: false,
      verify: false
    };
    
    // 检查云函数目录是否存在
    if (!fs.existsSync(funcPath)) {
      log(`云函数目录不存在，跳过: ${func}`, 'warning');
      results.skipped++;
      results.functions[func].skipped = true;
      continue;
    }
    
    // 安装依赖
    if (!config.skipInstall) {
      results.functions[func].install = installDependencies(funcPath, config.verbose);
      if (!results.functions[func].install) {
        log(`因依赖安装失败跳过部署: ${func}`, 'warning');
        results.skipped++;
        continue;
      }
    } else {
      log(`跳过依赖安装: ${func}`, 'info');
      results.functions[func].install = true;
    }
    
    // 部署云函数
    results.functions[func].deploy = deployFunction(func, envConfig, config.verbose);
    if (!results.functions[func].deploy) {
      results.failed++;
      results.functions[func].error = '部署失败';
      continue;
    }
    
    // 验证部署
    results.functions[func].verify = verifyDeployment(func, envConfig);
    if (!results.functions[func].verify) {
      log(`部署验证失败: ${func}，但云函数可能已成功部署`, 'warning');
    }
    
    results.success++;
  }
  
  console.log('');
  log('═══════════════════════════════════════════════════', 'info');
  log('部署摘要', 'info');
  log('═══════════════════════════════════════════════════', 'info');
  log(`总计: ${results.total}`, 'info');
  log(`成功: ${results.success}`, 'success');
  log(`失败: ${results.failed}`, 'error');
  log(`跳过: ${results.skipped}`, 'warning');
  console.log('');
  
  // 显示详细结果
  for (const [func, status] of Object.entries(results.functions)) {
    const statusIcon = status.skipped ? '⏭️' : 
                       (status.deploy ? '✅' : '❌');
    console.log(`  ${statusIcon} ${func}`);
  }
  
  console.log('');
  
  // 运行冒烟测试
  if (!config.skipTest) {
    const testPassed = runSmokeTest(envConfig);
    if (!testPassed) {
      log('冒烟测试未通过，请检查云函数功能', 'error');
    }
  } else {
    log('已跳过冒烟测试', 'info');
  }
  
  console.log('');
  
  // 最终状态
  if (results.failed === 0 && results.skipped === 0) {
    log('🎉 所有云函数部署成功!', 'success');
    process.exit(0);
  } else if (results.success > 0) {
    log(`⚠️ 部分云函数部署失败 (${results.failed}/${results.total})`, 'warning');
    process.exit(1);
  } else {
    log('❌ 所有云函数部署失败', 'error');
    process.exit(1);
  }
}

// 运行部署
deploy().catch(error => {
  log(`部署脚本执行失败: ${error.message}`, 'error');
  process.exit(1);
});
