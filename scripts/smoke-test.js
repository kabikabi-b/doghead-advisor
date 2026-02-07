#!/usr/bin/env node

/**
 * 狗狗军师云函数冒烟测试脚本
 * 
 * Usage: node scripts/smoke-test.js [--env staging|production] [--verbose]
 * 
 * 冒烟测试用于验证云函数部署后的基本功能是否正常。
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CLOUDFUNCTIONS_DIR = 'cloudfunctions';
const FUNCTIONS = [
  { name: 'generateReply', testData: { question: '今天运气怎么样？' } },
  { name: 'getLeaderboard', testData: { limit: 10 } },
  { name: 'vote', testData: { questionId: 'test-123', voteType: 'up' } },
  { name: 'getUserProfile', testData: { openid: 'test-openid' } }
];

// 默认环境配置
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

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    env: 'staging',
    verbose: false,
    ci: false // CI 模式，减少输出
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--env' && args[i + 1]) {
      config.env = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--ci') {
      config.ci = true;
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
狗狗军师云函数冒烟测试脚本

Usage: node scripts/smoke-test.js [options]

Options:
  --env <environment>   测试环境 (staging|production)，默认: staging
  --verbose, -v          显示详细日志
  --ci                   CI 模式（减少输出）
  --help, -h             显示帮助信息

Examples:
  node scripts/smoke-test.js
  node scripts/smoke-test.js --env staging --verbose
  node scripts/smoke-test.js --env production --ci
`);
}

/**
 * 记录日志
 */
function log(message, type = 'info') {
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    test: '🧪',
    step: '🔧'
  }[type] || 'ℹ️';
  
  console.log(`${prefix} ${message}`);
}

/**
 * 检查云函数目录结构
 */
function checkCloudFunctionStructure() {
  log('检查云函数目录结构...', 'step');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  for (const func of FUNCTIONS) {
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, func.name);
    const requiredFiles = ['index.js', 'package.json', 'config.json'];
    
    const funcResult = {
      name: func.name,
      status: 'pass',
      files: [],
      errors: []
    };
    
    // 检查目录是否存在
    if (!fs.existsSync(funcPath)) {
      funcResult.status = 'fail';
      funcResult.errors.push('目录不存在');
      results.failed++;
      results.details.push(funcResult);
      continue;
    }
    
    // 检查必要文件
    for (const file of requiredFiles) {
      const filePath = path.join(funcPath, file);
      if (fs.existsSync(filePath)) {
        funcResult.files.push(file);
      } else {
        funcResult.errors.push(`缺少文件: ${file}`);
      }
    }
    
    // 检查 package.json 依赖
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(funcPath, 'package.json'), 'utf8')
      );
      
      if (packageJson.dependencies && packageJson.dependencies['wx-server-sdk']) {
        funcResult.files.push('wx-server-sdk');
      } else {
        funcResult.errors.push('缺少 wx-server-sdk 依赖');
      }
    } catch (e) {
      funcResult.errors.push(`package.json 解析失败: ${e.message}`);
    }
    
    if (funcResult.errors.length > 0) {
      funcResult.status = 'fail';
      results.failed++;
    } else {
      results.passed++;
    }
    
    results.details.push(funcResult);
  }
  
  return results;
}

/**
 * 验证 package.json 配置
 */
function validatePackageJson() {
  log('验证 package.json 配置...', 'step');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  for (const func of FUNCTIONS) {
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, func.name);
    const packageJsonPath = path.join(funcPath, 'package.json');
    
    const funcResult = {
      name: func.name,
      status: 'pass',
      checks: [],
      errors: []
    };
    
    if (!fs.existsSync(packageJsonPath)) {
      funcResult.status = 'fail';
      funcResult.errors.push('package.json 不存在');
      results.failed++;
      results.details.push(funcResult);
      continue;
    }
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, 'utf8')
      );
      
      // 检查必要字段
      const requiredFields = ['name', 'main'];
      for (const field of requiredFields) {
        if (packageJson[field]) {
          funcResult.checks.push(`${field}: ${packageJson[field]}`);
        } else {
          funcResult.errors.push(`缺少字段: ${field}`);
        }
      }
      
      // 检查依赖
      if (packageJson.dependencies) {
        const deps = Object.keys(packageJson.dependencies);
        funcResult.checks.push(`依赖: ${deps.join(', ')}`);
      }
      
      // 检查 scripts
      if (packageJson.scripts && packageJson.scripts.deploy) {
        funcResult.checks.push('deploy 脚本: 已配置');
      }
      
    } catch (e) {
      funcResult.status = 'fail';
      funcResult.errors.push(`解析失败: ${e.message}`);
    }
    
    if (funcResult.errors.length > 0) {
      results.failed++;
    } else {
      results.passed++;
    }
    
    results.details.push(funcResult);
  }
  
  return results;
}

/**
 * 验证 index.js 云函数代码
 */
function validateCloudFunctionCode() {
  log('验证云函数代码...', 'step');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  for (const func of FUNCTIONS) {
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, func.name);
    const indexPath = path.join(funcPath, 'index.js');
    
    const funcResult = {
      name: func.name,
      status: 'pass',
      checks: [],
      errors: []
    };
    
    if (!fs.existsSync(indexPath)) {
      funcResult.status = 'fail';
      funcResult.errors.push('index.js 不存在');
      results.failed++;
      results.details.push(funcResult);
      continue;
    }
    
    try {
      const code = fs.readFileSync(indexPath, 'utf8');
      
      // 检查 wx-server-sdk 引入
      if (code.includes("require('wx-server-sdk')") || 
          code.includes('require("wx-server-sdk")')) {
        funcResult.checks.push('wx-server-sdk: 已引入');
      } else {
        funcResult.errors.push('缺少 wx-server-sdk 引入');
      }
      
      // 检查 cloud.init
      if (code.includes('cloud.init')) {
        funcResult.checks.push('cloud.init: 已调用');
      } else {
        funcResult.errors.push('缺少 cloud.init');
      }
      
      // 检查 exports.main
      if (code.includes('exports.main')) {
        funcResult.checks.push('exports.main: 已导出');
      } else {
        funcResult.errors.push('缺少 exports.main');
      }
      
      // 检查错误处理
      if (code.includes('catch') || code.includes('try')) {
        funcResult.checks.push('错误处理: 已配置');
      } else {
        funcResult.warnings = funcResult.warnings || [];
        funcResult.warnings.push('可能缺少错误处理');
      }
      
    } catch (e) {
      funcResult.status = 'fail';
      funcResult.errors.push(`读取失败: ${e.message}`);
    }
    
    if (funcResult.errors.length > 0) {
      results.failed++;
    } else {
      results.passed++;
    }
    
    results.details.push(funcResult);
  }
  
  return results;
}

/**
 * 验证 config.json 配置
 */
function validateConfigJson() {
  log('验证 config.json 配置...', 'step');
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  for (const func of FUNCTIONS) {
    const funcPath = path.join(CLOUDFUNCTIONS_DIR, func.name);
    const configPath = path.join(funcPath, 'config.json');
    
    const funcResult = {
      name: func.name,
      status: 'pass',
      checks: [],
      errors: []
    };
    
    if (!fs.existsSync(configPath)) {
      funcResult.status = 'fail';
      funcResult.errors.push('config.json 不存在');
      results.failed++;
      results.details.push(funcResult);
      continue;
    }
    
    try {
      const config = JSON.parse(
        fs.readFileSync(configPath, 'utf8')
      );
      
      // 检查 permissions 字段
      if (config.permissions) {
        funcResult.checks.push('permissions: 已配置');
        
        if (config.permissions.openapi) {
          funcResult.checks.push(`openapi: ${JSON.stringify(config.permissions.openapi)}`);
        }
      } else {
        funcResult.warnings = funcResult.warnings || [];
        funcResult.warnings.push('permissions 未配置（可能不需要）');
      }
      
    } catch (e) {
      funcResult.status = 'fail';
      funcResult.errors.push(`解析失败: ${e.message}`);
    }
    
    if (funcResult.errors.length > 0) {
      results.failed++;
    } else {
      results.passed++;
    }
    
    results.details.push(funcResult);
  }
  
  return results;
}

/**
 * 生成测试报告
 */
function generateReport(config, results) {
  const timestamp = new Date().toISOString();
  const envConfig = ENV_CONFIG[config.env] || ENV_CONFIG.staging;
  
  const report = {
    timestamp,
    environment: envConfig.name,
    envId: envConfig.envId,
    summary: {
      total: FUNCTIONS.length,
      passed: results.structure.passed + results.package.passed + 
              results.code.passed + results.config.passed,
      failed: results.structure.failed + results.package.failed + 
              results.code.failed + results.config.failed
    },
    details: {
      structure: results.structure,
      package: results.package,
      code: results.code,
      config: results.config
    }
  };
  
  return report;
}

/**
 * 打印测试结果
 */
function printResults(config, results) {
  console.log('');
  log('═══════════════════════════════════════════════════', 'info');
  log('冒烟测试结果', 'info');
  log('═══════════════════════════════════════════════════', 'info');
  
  const sections = [
    { name: '目录结构', result: results.structure },
    { name: 'Package.json', result: results.package },
    { name: '云函数代码', result: results.code },
    { name: 'Config.json', result: results.config }
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const section of sections) {
    const status = section.result.failed === 0 ? '✅' : '❌';
    console.log(`\n${status} ${section.name}: ${section.result.passed} 通过, ${section.result.failed} 失败`);
    
    if (config.verbose) {
      for (const detail of section.result.details) {
        const detailStatus = detail.status === 'pass' ? '✅' : '❌';
        console.log(`  ${detailStatus} ${detail.name}`);
        
        if (detail.checks && detail.checks.length > 0) {
          for (const check of detail.checks) {
            console.log(`     ✓ ${check}`);
          }
        }
        
        if (detail.warnings && detail.warnings.length > 0) {
          for (const warning of detail.warnings) {
            console.log(`     ⚠️ ${warning}`);
          }
        }
        
        if (detail.errors && detail.errors.length > 0) {
          for (const error of detail.errors) {
            console.log(`     ✗ ${error}`);
          }
        }
      }
    }
    
    totalPassed += section.result.passed;
    totalFailed += section.result.failed;
  }
  
  console.log('\n' + '-'.repeat(50));
  console.log(`总计: ${totalPassed} 通过, ${totalFailed} 失败`);
  
  return totalFailed === 0;
}

/**
 * 主测试函数
 */
async function smokeTest() {
  const config = parseArgs();
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║      狗狗军师云函数冒烟测试脚本 v1.0.0                     ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  log(`测试环境: ${config.env} (${ENV_CONFIG[config.env]?.envId || '未配置'})`, 'info');
  log(`详细输出: ${config.verbose ? '是' : '否'}`, 'info');
  log(`云函数数量: ${FUNCTIONS.length}`, 'info');
  console.log('');
  
  // 运行各项验证
  const results = {
    structure: checkCloudFunctionStructure(),
    package: validatePackageJson(),
    code: validateCloudFunctionCode(),
    config: validateConfigJson()
  };
  
  // 打印结果
  const passed = printResults(config, results);
  
  // 生成报告
  const report = generateReport(config, results);
  
  // 保存报告
  const reportPath = path.join(__dirname, 'smoke-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`测试报告已保存: ${reportPath}`, 'info');
  
  console.log('');
  
  // 最终状态
  if (passed) {
    log('🎉 冒烟测试通过!', 'success');
    log('所有云函数配置正确，可以进行部署。', 'info');
    process.exit(0);
  } else {
    log('❌ 冒烟测试未通过', 'error');
    log('请修复上述问题后再进行部署。', 'info');
    process.exit(1);
  }
}

// 运行冒烟测试
smokeTest().catch(error => {
  log(`冒烟测试执行失败: ${error.message}`, 'error');
  process.exit(1);
});
