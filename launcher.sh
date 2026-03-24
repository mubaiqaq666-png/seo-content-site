#!/bin/bash

# SEO内容站 - 桌面快速启动脚本

PROJECT_DIR="$HOME/.qclaw/workspace/seo-content-site"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# 显示菜单
clear
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║     🚀 SEO内容站 - 快速启动菜单           ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "  1️⃣  打开控制面板 (可视化配置)"
echo "  2️⃣  快速生成文章"
echo "  3️⃣  每日自动生成"
echo "  4️⃣  本地预览网站"
echo "  5️⃣  完整部署"
echo "  6️⃣  查看系统状态"
echo "  7️⃣  打开项目文件夹"
echo ""
echo "  0️⃣  退出"
echo ""
read -p "请选择 [0-7]: " choice

case $choice in
    1)
        echo "启动控制面板..."
        npm run dashboard
        ;;
    2)
        echo "快速生成文章..."
        npm run generate
        ;;
    3)
        echo "每日自动生成..."
        npm run daily
        ;;
    4)
        echo "启动本地预览..."
        npm run dev
        ;;
    5)
        echo "完整部署..."
        npm run deploy
        ;;
    6)
        echo "系统状态:"
        echo ""
        if [ -f "public/data/posts.json" ]; then
            POST_COUNT=$(cat public/data/posts.json | grep -c '"title"' 2>/dev/null || echo "0")
            echo "  📄 文章总数: $POST_COUNT 篇"
        fi
        echo "  📦 Node.js: $(node -v)"
        echo "  📦 项目目录: $PROJECT_DIR"
        if [ -d ".git" ]; then
            BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
            echo "  🌿 Git 分支: $BRANCH"
        fi
        echo ""
        read -p "按 Enter 返回菜单..."
        exec "$0"
        ;;
    7)
        open "$PROJECT_DIR"
        ;;
    0)
        echo "再见！"
        exit 0
        ;;
    *)
        echo "无效选项"
        sleep 1
        exec "$0"
        ;;
esac
