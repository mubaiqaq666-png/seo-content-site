#!/bin/bash

# 创建所有桌面快捷方式
DESKTOP="$HOME/Desktop"
PROJECT_DIR="$HOME/.qclaw/workspace/seo-content-site"

echo "📦 创建桌面快捷方式..."

# 1. 主菜单快捷方式
APP_DIR="$DESKTOP/SEO内容站.app"
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/Contents/MacOS"

cat > "$APP_DIR/Contents/MacOS/launcher" << 'EOF'
#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "bash ~/.qclaw/workspace/seo-content-site/launcher.sh"
end tell
EOF
chmod +x "$APP_DIR/Contents/MacOS/launcher"

cat > "$APP_DIR/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key><string>launcher</string>
    <key>CFBundleName</key><string>SEO内容站</string>
    <key>CFBundlePackageType</key><string>APPL</string>
</dict>
</plist>
EOF

# 2. 控制面板快捷方式
DASHBOARD_APP="$DESKTOP/SEO控制面板.app"
rm -rf "$DASHBOARD_APP"
mkdir -p "$DASHBOARD_APP/Contents/MacOS"

cat > "$DASHBOARD_APP/Contents/MacOS/launcher" << 'EOF'
#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "bash ~/.qclaw/workspace/seo-content-site/start-dashboard.sh"
end tell
delay 2
tell application "Safari"
    activate
    open location "http://localhost:3001"
end tell
EOF
chmod +x "$DASHBOARD_APP/Contents/MacOS/launcher"

cat > "$DASHBOARD_APP/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key><string>launcher</string>
    <key>CFBundleName</key><string>SEO控制面板</string>
    <key>CFBundlePackageType</key><string>APPL</string>
</dict>
</plist>
EOF

# 3. 一键部署到 Vercel
DEPLOY_APP="$DESKTOP/🚀部署到云端.app"
rm -rf "$DEPLOY_APP"
mkdir -p "$DEPLOY_APP/Contents/MacOS"

cat > "$DEPLOY_APP/Contents/MacOS/launcher" << 'EOF'
#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "bash ~/.qclaw/workspace/seo-content-site/deploy-vercel.sh"
end tell
EOF
chmod +x "$DEPLOY_APP/Contents/MacOS/launcher"

cat > "$DEPLOY_APP/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key><string>launcher</string>
    <key>CFBundleName</key><string>🚀部署到云端</string>
    <key>CFBundlePackageType</key><string>APPL</string>
</dict>
</plist>
EOF

# 4. 快速生成
GENERATE_APP="$DESKTOP/✨快速生成文章.app"
rm -rf "$GENERATE_APP"
mkdir -p "$GENERATE_APP/Contents/MacOS"

cat > "$GENERATE_APP/Contents/MacOS/launcher" << 'EOF'
#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "cd ~/.qclaw/workspace/seo-content-site && npm run generate && echo '' && echo '按任意键关闭...' && read -n 1"
end tell
EOF
chmod +x "$GENERATE_APP/Contents/MacOS/launcher"

cat > "$GENERATE_APP/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key><string>launcher</string>
    <key>CFBundleName</key><string>✨快速生成文章</string>
    <key>CFBundlePackageType</key><string>APPL</string>
</dict>
</plist>
EOF

# 5. 本地预览
PREVIEW_APP="$DESKTOP/🌐本地预览网站.app"
rm -rf "$PREVIEW_APP"
mkdir -p "$PREVIEW_APP/Contents/MacOS"

cat > "$PREVIEW_APP/Contents/MacOS/launcher" << 'EOF'
#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "cd ~/.qclaw/workspace/seo-content-site && npm run dev"
end tell
delay 3
tell application "Safari"
    activate
    open location "http://localhost:5173"
end tell
EOF
chmod +x "$PREVIEW_APP/Contents/MacOS/launcher"

cat > "$PREVIEW_APP/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key><string>launcher</string>
    <key>CFBundleName</key><string>🌐本地预览网站</string>
    <key>CFBundlePackageType</key><string>APPL</string>
</dict>
</plist>
EOF

echo ""
echo "✅ 已创建桌面快捷方式:"
echo ""
echo "   📱 SEO内容站        - 主菜单"
echo "   🖥️  SEO控制面板      - 可视化配置"
echo "   🚀 部署到云端        - ⭐一键部署到 Vercel（免费域名+SSL）"
echo "   ✨ 快速生成文章      - 一键生成"
echo "   🌐 本地预览网站      - 启动本地服务器"
echo ""
echo "💡 提示："
echo "   • 首次部署需要 GitHub 账号"
echo "   • Vercel 提供免费域名和 SSL 证书"
echo "   • 部署后每次 git push 会自动更新网站"
