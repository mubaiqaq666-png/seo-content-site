#!/usr/bin/env node

/**
 * 自动部署脚本
 * 1. 执行 generate.js 生成内容
 * 2. 自动 git add / commit / push
 * 3. 触发 Vercel 部署
 */

import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const configs = {
  branch: 'main',
  commitMessage: 'auto update content'
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
}

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`)
}

function logStep(step, message) {
  log(colors.blue, step, message)
}

function logSuccess(message) {
  log(colors.green, '✅', message)
}

function logWarning(message) {
  log(colors.yellow, '⚠️', message)
}

function logError(message) {
  log(colors.red, '❌', message)
}

// 检查 git 状态
function checkGit() {
  logStep('1/4', '检查 Git 状态...')
  
  try {
    execSync('git status', { stdio: 'pipe' })
    return true
  } catch {
    logError('当前目录不是 Git 仓库')
    logWarning('请先初始化 Git: git init')
    return false
  }
}

// 检查远程仓库
function checkRemote() {
  logStep('2/4', '检查远程仓库...')
  
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim()
    if (remote.includes('github.com') || remote.includes('gitlab.com')) {
      logSuccess(`已配置远程仓库: ${remote}`)
      return true
    }
  } catch {
    logError('未配置远程仓库 origin')
    logWarning('请先添加远程仓库: git remote add origin <你的仓库地址>')
    return false
  }
  return false
}

// 执行内容生成
function runGenerate() {
  logStep('3/4', '生成 SEO 内容...')
  
  try {
    // 运行 generate.js
    const generatePath = path.join(__dirname, 'generate.js')
    execSync(`node "${generatePath}"`, { 
      stdio: 'inherit',
      cwd: __dirname
    })
    logSuccess('内容生成完成')
    return true
  } catch (error) {
    logError('内容生成失败')
    return false
  }
}

// Git 提交并推送
function gitPush() {
  logStep('4/4', '提交并推送代码...')
  
  try {
    // Git add
    logSuccess('执行 git add .')
    execSync('git add .', { stdio: 'pipe' })
    
    // 检查是否有更改
    const status = execSync('git status --short', { encoding: 'utf-8' })
    
    if (!status.trim()) {
      logWarning('没有检测到文件变化')
      return false
    }
    
    console.log('\n📋 变更文件:')
    status.trim().split('\n').forEach(line => console.log('   ' + line))
    
    // Git commit
    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    const commitMsg = `${configs.commitMessage} [${timestamp}]`
    
    logSuccess(`执行 git commit -m "${commitMsg}"`)
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'pipe' })
    
    // Git push
    logSuccess('执行 git push...')
    execSync(`git push origin ${configs.branch}`, { stdio: 'inherit' })
    
    return true
    
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      logWarning('没有文件需要提交')
      return false
    }
    logError('Git 操作失败')
    logWarning('可能的原因:')
    logWarning('  1. 未配置 Git 用户信息')
    logWarning('  2. SSH key 未配置或过期')
    logWarning('  3. 网络连接问题')
    return false
  }
}

// 主函数
function main() {
  console.log('\n' + '='.repeat(50))
  console.log('🚀 SEO内容站 - 自动部署系统')
  console.log('='.repeat(50) + '\n')

  try {
    // 1. 检查 Git
    if (!checkGit()) {
      console.log('\n❌ Git 检查失败，退出')
      process.exit(1)
    }
    logSuccess('Git 检查通过\n')

    // 2. 检查远程仓库
    if (!checkRemote()) {
      console.log('\n⚠️ 远程仓库未配置，跳过 push\n')
    }

    // 3. 生成内容
    if (!runGenerate()) {
      console.log('\n❌ 内容生成失败，退出')
      process.exit(1)
    }
    console.log('')

    // 4. Git push
    const pushed = gitPush()

    console.log('\n' + '='.repeat(50))
    
    if (pushed) {
      console.log('🎉 部署触发成功！')
      console.log('='.repeat(50))
      console.log('\n📌 部署状态:')
      console.log('   • Vercel 将自动检测到 Git 更新')
      console.log('   • 预计 1-3 分钟完成部署')
      console.log('   • 访问 https://vercel.com/dashboard 查看状态\n')
    } else {
      console.log('✅ 脚本执行完成（无新内容需要部署）')
      console.log('='.repeat(50) + '\n')
    }

  } catch (error) {
    console.error('\n❌ 部署失败:', error.message)
    console.log('\n📌 常见问题排查:')
    console.log('   1. 确保已安装 Node.js')
    console.log('   2. 确保 Git 已正确配置')
    console.log('   3. 确保远程仓库可访问')
    console.log('   4. 手动运行: npm install && npm run generate\n')
    process.exit(1)
  }
}

main()
