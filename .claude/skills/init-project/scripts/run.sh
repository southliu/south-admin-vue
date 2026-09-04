#!/bin/bash
# init-project 清理包装脚本
# 用法: bash .claude/skills/init-project/scripts/run.sh [--dry-run]

set -e

# 检查 python3
if command -v python3 >/dev/null 2>&1; then
  PYTHON=python3
else
  PYTHON=python
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

$PYTHON "$SCRIPT_DIR/cleanup.py" "$@"
