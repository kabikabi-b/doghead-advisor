#!/bin/bash

# 狗狗军师云函数部署脚本
# 
# Usage: ./scripts/deploy-cloudfunctions.sh
# 
# 注意: 需要在微信开发者工具中执行
# 1. 打开微信开发者工具
# 2. 展开 cloudfunctions 目录
# 3. 右键点击每个云函数 → "上传并部署：云端安装依赖"

cd "$(dirname "$0")/.."

echo "============================================"
echo "  狗狗军师云函数部署脚本"
echo "============================================"
echo ""
echo "请在微信开发者工具中执行以下操作:"
echo ""
echo "1. 展开 cloudfunctions 目录"
echo ""
for func in cloudfunctions/*/; do
  func_name=$(basename "$func")
  echo "2. 右键点击 '$func_name' → '上传并部署：云端安装依赖'"
done
echo ""
echo "============================================"
echo ""
echo "或者运行一键部署:"
echo "  node scripts/deploy-all.js --env staging"
