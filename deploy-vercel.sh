#!/bin/bash

# =============================================
# SEO内容站 - 一键部署到 Vercel
# =============================================

set -e

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║     🚀 SEO内容站 - Vercel一键部署         ║"
echo "╚════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$HOME/.qclaw/workspace/seo-content-site"
cd "$PROJECT_DIR"

# 1. 检查 GitHub 仓库
echo -e "${BLUE}[1/5]${NC} 检查 GitHub 仓库..."

if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  未检测到 Git 仓库${NC}"
    echo ""
    read -p "请输入你的 GitHub 仓库地址 (例如: https://github.com/用户名/seo-site): " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}❌ 未提供仓库地址${NC}"
        echo ""
        echo "请先在 GitHub 创建仓库，然后运行此脚本"
        exit 1
    fi
    
    echo -e "${BLUE}初始化 Git 仓库...${NC}"
    git init
    git remote add origin "$REPO_URL"
fi

GIT_USER=$(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/]\([^/]*\).*/\1/' || echo "")
GIT_REPO=$(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/].*[/]\(.*\)\.git/\1/' || echo "")

if [ -z "$GIT_USER" ] || [ -z "$GIT_REPO" ]; then
    echo -e "${RED}❌ 无法解析 GitHub 仓库信息${NC}"
    echo "请确保 remote URL 格式正确"
    exit 1
fi

echo -e "${GREEN}✅ 仓库: $GIT_USER/$GIT_REPO${NC}"

# 2. 生成内容
echo ""
echo -e "${BLUE}[2/5]${NC} 生成 SEO 内容..."
node src/scripts/generate.js

# 3. 提交代码
echo ""
echo -e "${BLUE}[3/5]${NC} 提交代码到 GitHub..."

git add .
git commit -m "deploy: ready for Vercel [$(date '+%Y-%m-%d %H:%M:%S')]" 2>/dev/null || echo "没有新变更需要提交"

echo -e "${GREEN}推送代码到 GitHub...${NC}"
git push origin main 2>/dev/null || git push origin master 2>/dev/null

echo -e "${GREEN}✅ 代码已推送到 GitHub${NC}"

# 4. 安装 Vercel CLI
echo ""
echo -e "${BLUE}[4/5]${NC} 检查 Vercel CLI..."

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}安装 Vercel CLI...${NC}"
    npm install -g vercel
fi

# 5. 部署
echo ""
echo -e "${BLUE}[5/5]${NC} 部署到 Vercel..."
echo ""

# 运行 vercel 部署
cd "$PROJECT_DIR"
vercel --yes --prod 2>&1 | tee /tmp/vercel-deploy.log

# 提取部署 URL
DEPLOY_URL=$(grep -o 'https://[^ ]*\.vercel\.app' /tmp/vercel-deploy.log | head -1)

echo ""
echo "╔════════════════════════════════════════════╗"
if [ -n "$DEPLOY_URL" ]; then
    echo -e "${GREEN}║     🎉 部署成功！                        ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    echo -e "🌐 你的网站已上线:"
    echo -e "   ${CYAN}$DEPLOY_URL${NC}"
    echo ""
    echo -e "🔒 SSL 证书已自动配置"
    echo -e "🌍 全球 CDN 已启用"
    echo ""
    echo -e "📌 下次部署: 只需运行 ${YELLOW}git push${NC} 即可自动触发"
else
    echo -e "${YELLOW}║     ⚠️  部署进行中                       ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    echo -e "请访问 ${CYAN}https://vercel.com/dashboard${NC} 查看部署状态"
fi
echo ""

# 保存部署信息
echo "$DEPLOY_URL" > .vercel-url
