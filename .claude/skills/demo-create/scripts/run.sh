#!/bin/bash
# demo-create 代码生成包装脚本
# 用法: bash .claude/skills/demo-create/scripts/run.sh '<config_json>'

set -e

# 检查 python3
if command -v python3 >/dev/null 2>&1; then
  PYTHON=python3
else
  PYTHON=python
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

$PYTHON "$SCRIPT_DIR/generate.py" "$1"
