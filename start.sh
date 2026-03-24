#!/bin/bash

# =============================================
# SEO内容站 - Mac一键运行脚本
# =============================================

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印函数
print_step() {
    echo -e "${BLUE}[📦]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌]${NC} $1"
}

# 欢迎信息
echo ""
echo "================================================"
echo -e "${GREEN}🚀 SEO内容站 - Mac一键运行脚本${NC}"
echo "================================================"
echo ""

# 记录开始时间
START_TIME=$(date +%s)

# 1. 检查并进入项目目录
print_step "检查项目目录..."
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"
print_success "当前目录: $PROJECT_DIR"

# 2. 检查 Node.js
print_step "检查 Node.js..."
if ! command -v node &> /dev/null; then
    print_error "未安装 Node.js"
    echo ""
    echo "请先安装 Node.js:"
    echo "  方式1: 访问 https://nodejs.org 下载安装包"
    echo "  方式2: 使用 Homebrew: brew install node"
    echo ""
    exit 1
fi
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
print_success "Node.js 版本: $NODE_VERSION"
print_success "npm 版本: $NPM_VERSION"

# 3. 检查并安装依赖
print_step "安装项目依赖..."
if [ ! -d "node_modules" ]; then
    print_warning "首次运行，需要安装依赖（约1-3分钟）..."
    npm install
    print_success "依赖安装完成"
else
    print_success "依赖已存在，跳过安装"
fi

# 4. 显示菜单
echo ""
echo "================================================"
echo -e "${CYAN}请选择操作模式:${NC}"
echo "================================================"
echo ""
echo "  1) 🎯 快速生成 (生成预设文章并部署)"
echo "  2) 🔥 每日自动 (抓取热搜生成文章)"
echo "  3) 🖥️  打开控制面板 (可视化配置)"
echo "  4) 📊 查看状态"
echo "  5) 🚀 完整部署 (生成+Git+推送)"
echo ""
echo "  0) 退出"
echo ""
read -p "请输入选项 [1-5]: " CHOICE
echo ""

case $CHOICE in
    1)
        print_step "快速生成模式..."
        node src/scripts/generate.js
        ;;
    2)
        print_step "每日自动模式..."
        node src/scripts/dailyGenerate.js
        ;;
    3)
        print_step "启动控制面板..."
        echo ""
        print_success "控制面板地址: http://localhost:3001"
        echo "按 Ctrl+C 停止服务"
        echo ""
        npx vite --port 3001 src/dashboard/index.html
        exit 0
        ;;
    4)
        print_step "系统状态..."
        echo ""
        if [ -f "public/data/posts.json" ]; then
            POST_COUNT=$(cat public/data/posts.json | grep -c '"title"' 2>/dev/null || echo "0")
            echo "  📄 文章总数: $POST_COUNT 篇"
        fi
        echo "  📦 Node.js: $NODE_VERSION"
        echo "  📦 项目目录: $PROJECT_DIR"
        if [ -d ".git" ]; then
            BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
            echo "  🌿 Git 分支: $BRANCH"
            REMOTE=$(git remote get-url origin 2>/dev/null || echo "未配置")
            echo "  🌐 远程仓库: $REMOTE"
        fi
        echo ""
        exit 0
        ;;
    5)
        print_step "完整部署模式..."
        ;;
    0)
        echo "再见!"
        exit 0
        ;;
    *)
        print_warning "无效选项，执行默认快速生成..."
        node src/scripts/generate.js
        ;;
esac

# 5. Git 初始化（如果需要）
if [ ! -d ".git" ]; then
    print_warning "未检测到 Git 仓库"
    echo ""
    read -p "是否初始化 Git 仓库? (y/n): " INIT_GIT
    if [ "$INIT_GIT" = "y" ] || [ "$INIT_GIT" = "Y" ]; then
        print_step "初始化 Git 仓库..."
        git init
        git add .
        git commit -m "Initial commit: SEO内容站初始化"
        print_success "Git 仓库已初始化"
        echo ""
        echo "📌 请设置远程仓库地址:"
        echo "   git remote add origin <你的GitHub仓库地址>"
        echo "   git push -u origin main"
        echo ""
    fi
fi

# 6. Git 提交
if [ -d ".git" ]; then
    print_step "提交代码到 Git..."
    
    # 检查是否有变更
    if git diff --quiet && git diff --cached --quiet; then
        print_warning "没有检测到文件变更"
    else
        git add .
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        git commit -m "auto update content [${TIMESTAMP}]"
        print_success "代码已提交"
    fi
fi

# 7. Git Push
if [ -d ".git" ]; then
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -n "$REMOTE_URL" ]; then
        print_step "推送到远程仓库..."
        git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null || {
            print_warning "推送失败，请检查:"
            echo "   1. SSH key 是否配置 (ssh -T git@github.com)"
            echo "   2. 仓库访问权限"
            echo "   3. 网络连接"
        }
        if [ $? -eq 0 ]; then
            print_success "代码已推送到远程仓库"
        fi
    else
        print_warning "未配置远程仓库，跳过推送"
        echo "   请手动执行: git remote add origin <仓库地址>"
    fi
fi

# 8. 提示下一步操作
echo ""
echo "================================================"
print_success "🎉 全部完成！"
echo "================================================"
echo ""
echo "📌 常用命令:"
echo ""
echo "   npm run dev        # 本地预览网站"
echo "   npm run generate   # 快速生成文章"
echo "   npm run daily      # 每日自动生成"
echo "   npm run dashboard  # 打开控制面板"
echo "   npm run deploy     # 完整部署"
echo ""
echo "📌 定时任务设置:"
echo "   在系统 crontab 添加: 0 9 * * * cd $PROJECT_DIR && npm run daily"
echo ""

# 计算耗时
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
echo -e "${BLUE}[⏱️]${NC} 总耗时: ${ELAPSED}秒"
echo ""
