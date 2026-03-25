#!/bin/bash

# 设置每日自动运行（Mac launchd）
PROJECT_DIR="$HOME/.qclaw/workspace/seo-content-site"
NODE_PATH=$(which node)
PLIST="$HOME/Library/LaunchAgents/com.hotsite.daily.plist"

cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hotsite.daily</string>
    <key>ProgramArguments</key>
    <array>
        <string>$NODE_PATH</string>
        <string>$PROJECT_DIR/src/scripts/dailyGenerate.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/daily.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/daily-error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
EOF

# 加载任务
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

echo "✅ 每日自动任务已设置（每天 09:00 自动运行）"
echo "📋 任务文件: $PLIST"
echo ""
echo "管理命令:"
echo "  查看状态: launchctl list | grep hotsite"
echo "  立即运行: launchctl start com.hotsite.daily"
echo "  停止任务: launchctl unload $PLIST"
