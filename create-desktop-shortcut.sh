#!/bin/bash

DESKTOP="$HOME/Desktop"

echo "📦 创建桌面快捷方式..."

# 通用创建函数
make_app() {
  local name="$1"
  local script="$2"
  local app="$DESKTOP/${name}.app"
  rm -rf "$app"
  mkdir -p "$app/Contents/MacOS"
  echo "$script" > "$app/Contents/MacOS/launcher"
  chmod +x "$app/Contents/MacOS/launcher"
  cat > "$app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key><string>launcher</string>
    <key>CFBundleName</key><string>${name}</string>
    <key>CFBundlePackageType</key><string>APPL</string>
</dict>
</plist>
EOF
}

# 1. 内容管理器（CMS）
make_app "✏️ 内容管理器" '#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "cd ~/.qclaw/workspace/seo-content-site && node src/scripts/cms.js"
end tell'

# 2. 一键同步到云端
make_app "☁️ 同步到云端" '#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "bash ~/.qclaw/workspace/seo-content-site/sync.sh"
end tell'

# 3. 控制面板
make_app "🖥️ SEO控制面板" '#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "bash ~/.qclaw/workspace/seo-content-site/start-dashboard.sh"
end tell
delay 2
tell application "Safari"
    activate
    open location "http://localhost:3001"
end tell'

# 4. 每日自动生成
make_app "🔥 每日自动生成" '#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "cd ~/.qclaw/workspace/seo-content-site && node src/scripts/dailyGenerate.js"
end tell'

# 5. 本地预览
make_app "🌐 本地预览网站" '#!/usr/bin/osascript
tell application "Terminal"
    activate
    do script "cd ~/.qclaw/workspace/seo-content-site && npm run dev"
end tell
delay 3
tell application "Safari"
    activate
    open location "http://localhost:5173"
end tell'

# 6. 打开线上网站
make_app "🚀 打开线上网站" '#!/usr/bin/osascript
tell application "Safari"
    activate
    open location "https://seo-content-site.vercel.app/"
end tell'

echo ""
echo "✅ 已创建桌面快捷方式:"
echo ""
echo "   ✏️  内容管理器     - 增删改文章、批量添加关键词"
echo "   ☁️  同步到云端     - 一键推送到 Vercel"
echo "   🖥️  SEO控制面板   - 可视化配置"
echo "   🔥 每日自动生成   - 抓取热搜生成文章"
echo "   🌐 本地预览网站   - 启动本地服务器"
echo "   🚀 打开线上网站   - 直接打开 Vercel 网站"
