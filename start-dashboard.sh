#!/bin/bash

# 杀死占用端口的旧进程
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

# 启动控制面板
cd ~/.qclaw/workspace/seo-content-site
node src/scripts/dashboard-server.js
