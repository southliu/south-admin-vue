---
name: init-project
description: 清理 Vue Admin 项目模板中的演示代码（demo 页面、content 页面、Github 组件、demo 菜单和相关语言包），将模板项目初始化为干净的起始项目。执行前默认进行 dry-run 预览，用户确认后才会真正执行删除和修改操作。
---

# init-project

## Description
清理 Vue Admin 项目模板中的演示代码（demo 页面、content 页面、Github 组件、demo 菜单和相关语言包），将模板项目初始化为干净的起始项目。

## Instructions

### 清理范围

1. **删除文件/目录**：
   - `src/pages/demo/` — 演示页面（剪切板、水印、虚拟滚动、富文本、层级路由）
   - `src/pages/content/` — 内容管理演示页面（文章管理）
   - `src/components/Github/` — Github 图标组件
   - `src/servers/content/` — 文章管理 API
   - `src/menus/demo.ts` — 静态演示菜单
   - `src/locales/zh/content.ts` — 文章管理中文语言包
   - `src/locales/en/content.ts` — 文章管理英文语言包

2. **修改文件**：
   - `src/layouts/components/Header.vue` — 移除 Github 组件导入和使用

### 执行流程

1. **默认先执行 dry-run 预览**：
   ```bash
   python3 .claude/skills/init-project/scripts/cleanup.py --dry-run
   ```

2. **向用户展示预览结果，等待用户确认**

3. **用户确认后执行清理**：
   ```bash
   python3 .claude/skills/init-project/scripts/cleanup.py
   ```

4. **验证清理结果**：
   ```bash
   pnpm lint
   pnpm dev
   ```

### 注意事项

- 文件不存在时安全跳过（模板可能已清理过）
- 使用精确字符串匹配进行代码替换，避免误删
- 也可以通过 npm script 执行：`pnpm init:project`（支持 `--yes` 跳过确认，`--dry-run` 预览）
