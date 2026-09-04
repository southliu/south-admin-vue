#!/usr/bin/env node
/**
 * Vue Admin 项目初始化入口
 * 用法:
 *   node .claude/skills/init-project/scripts/init.mjs            # 交互式确认
 *   node .claude/skills/init-project/scripts/init.mjs --yes      # 跳过确认
 *   node .claude/skills/init-project/scripts/init.mjs --dry-run  # 预览
 */

import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const skipConfirm = args.includes('--yes') || args.includes('-y');
const dryRun = args.includes('--dry-run');

/** 检测可用的 python 命令 */
function findPython() {
  for (const cmd of ['python3', 'python']) {
    const result = spawnSync(cmd, ['--version'], { encoding: 'utf-8', shell: true });
    if (result.status === 0) {
      return cmd;
    }
  }
  return null;
}

/** 运行清理脚本 */
function runCleanup(extraArgs = []) {
  const python = findPython();
  if (!python) {
    console.error('错误: 未找到 python3/python 命令，请安装 Python 3.6+');
    process.exit(1);
  }

  const script = path.join(__dirname, 'cleanup.py');
  const result = spawnSync(python, [script, ...extraArgs], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Vue Admin 项目模板清理');
  console.log('='.repeat(50));

  // 先预览
  console.log('\n[1/2] 预览清理内容:\n');
  runCleanup(['--dry-run']);

  // 确认
  if (skipConfirm) {
    console.log('\n跳过确认（--yes），直接执行清理');
  } else {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question('\n确认执行清理吗？(y/N): ');
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('已取消清理');
      return;
    }
  }

  // 执行
  console.log('\n[2/2] 执行清理:\n');
  runCleanup();

  console.log('\n清理完成！建议运行以下命令验证:');
  console.log('  pnpm lint');
  console.log('  pnpm dev');
}

main().catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});
