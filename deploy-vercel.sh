#!/bin/bash
# =============================================
# SEO内容站 - 快速构建 + 部署脚本
# 支持 Vercel + 国内 CDN 加速
# =============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🚀 SEO内容站 - 构建+部署              ║"
echo "╚══════════════════════════════════════════╝"
echo ""

PROJECT_DIR="$HOME/.qclaw/workspace/seo-content-site"
cd "$PROJECT_DIR"

# 1. 生成内容
echo -e "${BLUE}[1/5]${NC} 生成文章内容..."
node src/scripts/generate.js

# 2. 安装依赖
echo ""
echo -e "${BLUE}[2/5]${NC} 检查依赖..."
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}安装依赖...${NC}"
  npm install
fi

# 3. 构建
echo ""
echo -e "${BLUE}[3/5]${NC} 构建生产版本..."
npm run build

# 检查 dist 目录
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ 构建失败：dist 目录不存在${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 构建成功！${NC}"

DIST_SIZE=$(du -sh dist | cut -f1)
echo -e "   产物大小：${CYAN}$DIST_SIZE${NC}"

# 4. 部署
echo ""
echo -e "${BLUE}[4/5]${NC} 部署到 Vercel..."
echo ""

if command -v vercel &> /dev/null; then
  vercel --yes --prod 2>&1 | tee /tmp/vercel-deploy.log
  DEPLOY_URL=$(grep -o 'https://[^ ]*\.vercel\.app' /tmp/vercel-deploy.log | head -1)
else
  echo -e "${YELLOW}Vercel CLI 未安装，引导部署...${NC}"
  echo -e "   1. 安装：npm i -g vercel"
  echo -e "   2. 登录：vercel login"
  echo -e "   3. 部署：vercel --prod"
  echo ""
  echo -e "   或者手动将 dist 目录上传到你的服务器/CDN"
  DEPLOY_URL=""
fi

# 5. 完成
echo ""
echo "╔══════════════════════════════════════════╗"
if [ -n "$DEPLOY_URL" ]; then
  echo -e "${GREEN}║   🎉 部署成功！                       ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo -e "🌐 网站地址：${CYAN}$DEPLOY_URL${NC}"
  echo ""
  echo -e "📌 国内访问优化："
  echo -e "   Vercel 自动启用全球 CDN，国内访问推荐配合"
  echo -e "   国内镜像服务（如 Netlify CN、自动秒信/织雁云）"
  echo ""
  echo -e "📌 广告接入："
  echo -e "   编辑 src/data/ads.config.js 配置广告 ID"
  echo ""
else
  echo -e "${YELLOW}║   ⚠️  需手动部署                     ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo -e "dist 目录已准备就绪（大小：${CYAN}$DIST_SIZE${NC}）"
  echo -e "请通过 Vercel / Netlify / 你的服务器上传部署"
fi
echo ""
