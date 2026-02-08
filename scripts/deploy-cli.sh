#!/bin/bash

# 微信小程序云函数 CLI 部署脚本
# 
# 使用方法:
#   ./scripts/deploy-cli.sh <命令>
#
# 命令:
#   login     登录微信开发者工具
#   deploy    部署所有云函数
#   deploy-func <name>  部署单个云函数
#   status    检查登录状态
#   help      显示帮助

set -e

# 配置
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WECHAT_CLI="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
ENV_ID="doghead-advisor"
APP_ID="wx3ae4dfecd97351ea"

# 云函数列表
CLOUDFUNCTIONS=(
  "generateReply"
  "vote"
  "getLeaderboard"
  "getLikeStatus"
  "getUserProfile"
  "getUserStats"
  "initDb"
  "fixQuestions"
)

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 CLI 是否可用
check_cli() {
  if [ ! -f "$WECHAT_CLI" ]; then
    log_error "微信开发者工具 CLI 未找到: $WECHAT_CLI"
    log_info "请安装微信开发者工具: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
    exit 1
  fi
  log_success "微信开发者工具 CLI 已找到"
}

# 检查登录状态
check_login() {
  log_info "检查登录状态..."
  
  # 方法1: 检查 CLI islogin
  if "$WECHAT_CLI" index.js islogin --project "$PROJECT_DIR" 2>/dev/null | grep -q "true"; then
    log_success "已登录"
    return 0
  fi
  
  # 方法2: 尝试获取登录状态
  if "$WECHAT_CLI" index.js islogin 2>&1 | grep -q "islogin"; then
    log_warn "请先登录微信开发者工具"
    log_info "运行: $0 login"
    return 1
  fi
  
  log_warn "登录状态未知，请确保开发者工具已登录"
  return 1
}

# 登录
do_login() {
  log_info "登录微信开发者工具..."
  log_info "请在弹出的窗口中完成扫码登录"
  
  "$WECHAT_CLI" index.js login
  
  if check_login; then
    log_success "登录成功"
  else
    log_error "登录失败"
    exit 1
  fi
}

# 部署单个云函数
deploy_function() {
  local func_name=$1
  
  if [ -z "$func_name" ]; then
    log_error "请指定云函数名称"
    return 1
  fi
  
  local func_path="$PROJECT_DIR/cloudfunctions/$func_name"
  
  if [ ! -d "$func_path" ]; then
    log_error "云函数不存在: $func_path"
    return 1
  fi
  
  log_info "部署云函数: $func_name"
  
  # 检查 package.json
  if [ ! -f "$func_path/package.json" ]; then
    log_error "package.json 不存在: $func_path/package.json"
    return 1
  fi
  
  # 使用微信开发者工具 CLI 部署
  # 注意: 需要开发者工具运行并开启服务端口
  
  # 方法1: 通过 IDE 部署 (需要手动操作)
  log_info "请在微信开发者工具中手动部署:"
  log_info "  1. 右键点击 cloudfunctions/$func_name"
  log_info "  2. 选择 '上传并部署：云端安装依赖'"
  
  # 方法2: 如果 CLI 支持，使用命令行部署
  log_info "尝试 CLI 部署..."
  
  # 尝试打开项目并触发部署
  "$WECHAT_CLI" index.js open --project "$PROJECT_DIR" --appid "$APP_ID" 2>/dev/null &
  
  log_warn "请在开发者工具中完成云函数部署"
  log_info "部署完成后按回车继续..."
  read -r
  
  return 0
}

# 部署所有云函数
deploy_all() {
  log_info "开始部署所有云函数..."
  log_info "环境: $ENV_ID"
  log_info "AppID: $APP_ID"
  echo ""
  
  # 检查登录
  if ! check_login; then
    log_error "请先登录"
    exit 1
  fi
  
  local success=0
  local failed=0
  
  for func_name in "${CLOUDFUNCTIONS[@]}"; do
    if deploy_function "$func_name"; then
      ((success++))
    else
      ((failed++))
    fi
    echo ""
  done
  
  echo ""
  log_info "部署完成: $success 成功, $failed 失败"
  
  if [ $failed -gt 0 ]; then
    return 1
  fi
}

# 使用 miniprogram-ci 部署 (推荐用于 CI/CD)
deploy_ci() {
  log_info "使用 miniprogram-ci 进行 CI/CD 部署..."
  
  # 检查是否安装了 miniprogram-ci
  if ! command -v npx &> /dev/null; then
    log_error "npx 未安装，请先安装 Node.js"
    exit 1
  fi
  
  log_info "安装 miniprogram-ci..."
  npm install --save-dev miniprogram-ci
  
  log_info "创建 CI 部署脚本..."
  
  # 创建 CI 部署脚本
  cat > "$PROJECT_DIR/scripts/deploy-ci.js" << 'CI_SCRIPT'
/**
 * miniprogram-ci 云函数部署脚本
 * 
 * 使用方法:
 *   npx miniprogram-ci \
 *     --appid wx3ae4dfecd97351ea \
 *     --type miniProgram \
 *     --privateKeyPath ./private.key \
 *     --projectPath . \
 *     deployCloudFunction --name generateReply
 */

const { uploadCloudFunction, deployAllCloudFunction } = require('miniprogram-ci');

async function ciDeploy() {
  const { appid, privateKeyPath, projectPath } = process.env;
  
  if (!appid || !privateKeyPath || !projectPath) {
    console.error('缺少必要环境变量: appid, privateKeyPath, projectPath');
    process.exit(1);
  }
  
  console.log('🚀 开始 CI/CD 部署...');
  console.log(`AppID: ${appid}`);
  console.log(`项目路径: ${projectPath}`);
  
  // 部署所有云函数
  await deployAllCloudFunction({
    appid,
    projectPath,
    privateKeyPath,
    envId: 'doghead-advisor', // 云开发环境 ID
    onProgressUpdate: (info) => {
      console.log(`[${info.name}] ${info.status}: ${info.message || ''}`);
    }
  });
  
  console.log('✅ CI/CD 部署完成');
}

ciDeploy().catch(err => {
  console.error('❌ 部署失败:', err);
  process.exit(1);
});
CI_SCRIPT
  
  log_success "CI 部署脚本已创建: scripts/deploy-ci.js"
  log_info ""
  log_info "使用方法:"
  log_info "  1. 获取微信私钥 (在微信公众平台下载)"
  log_info "  2. 设置环境变量并运行:"
  log_info ""
  log_info "  export WECHAT_APPID=wx3ae4dfecd97351ea"
  log_info "  export WECHAT_PRIVATE_KEY_PATH=./private.key"
  log_info "  export WECHAT_PROJECT_PATH=/path/to/project"
  log_info "  node scripts/deploy-ci.js"
}

# 显示帮助
show_help() {
  echo ""
  echo "🐕 狗头军师 - 微信云函数部署脚本"
  echo ""
  echo "用法: $0 <命令> [选项]"
  echo ""
  echo "命令:"
  echo "  login          登录微信开发者工具"
  echo "  deploy         部署所有云函数"
  echo "  deploy-func <name>  部署单个云函数"
  echo "  deploy-ci      使用 miniprogram-ci 部署 (CI/CD)"
  echo "  status         检查登录状态"
  echo "  help           显示帮助"
  echo ""
  echo "环境变量:"
  echo "  WECHAT_ENV_ID      云开发环境 ID (默认: doghead-advisor)"
  echo "  WECHAT_APPID       小程序 AppID"
  echo ""
  echo "示例:"
  echo "  $0 login"
  echo "  $0 deploy"
  echo "  $0 deploy-func generateReply"
  echo "  $0 deploy-ci"
  echo ""
}

# 主函数
main() {
  local command=${1:-help}
  
  check_cli
  
  case $command in
    login)
      do_login
      ;;
    deploy)
      deploy_all
      ;;
    deploy-func)
      deploy_function "$2"
      ;;
    deploy-ci)
      deploy_ci
      ;;
    status)
      check_login
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      log_error "未知命令: $command"
      show_help
      exit 1
      ;;
  esac
}

main "$@"
