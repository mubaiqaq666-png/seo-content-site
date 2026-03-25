#!/bin/bash

# =============================================
# SEO内容站 - 一键同步到云端
# =============================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$HOME/.qclaw/workspace/seo-content-site"
cd "$PROJECT_DIR"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗"
echo -e "║     ☁️  一键同步到 Vercel               ║"
echo -e "╚══════════════════════════════════════════╝${NC}"
echo ""

# 检查是否有变更
STATUS=$(git status --short)
if [ -z "$STATUS" ]; then
  echo -e "${YELLOW}⚠️  没有检测到文件变更${NC}"
  echo ""
  read -p "是否强制重新生成内容并同步？(y/n): " FORCE
  if [ "$FORCE" != "y" ]; then
    echo "已取消"
    exit 0
  fi
  node src/scripts/generate.js
fi

# 显示变更文件
echo -e "${BLUE}📋 变更文件:${NC}"
git status --short | while read line; do
  echo "   $line"
done
echo ""

# 提交说明
read -p "提交说明（回车使用默认）: " MSG
if [ -z "$MSG" ]; then
  MSG="content update [$(date '+%Y-%m-%d %H:%M:%S')]"
fi

# Git 提交
echo ""
echo -e "${BLUE}[1/2]${NC} 提交代码..."
git add .
git commit -m "$MSG"

# Git 推送
echo -e "${BLUE}[2/2]${NC} 推送到 GitHub..."
git push origin main

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗"
echo -e "║     🎉 同步成功！                        ║"
echo -e "╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "🌐 网站地址: ${CYAN}https://seo-content-site.vercel.app/${NC}"
echo -e "⏱️  Vercel 将在 1-2 分钟内自动更新"
echo ""
echo -e "📊 查看部署状态: ${CYAN}https://vercel.com/dashboard${NC}"
echo ""
