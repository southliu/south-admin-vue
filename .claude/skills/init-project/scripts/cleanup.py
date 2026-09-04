#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vue Admin 项目模板清理脚本
删除演示代码（demo/content 页面、Github 组件、demo 菜单、相关语言包）
用法:
  python3 cleanup.py            # 执行清理
  python3 cleanup.py --dry-run  # 预览（不实际修改）
  python3 cleanup.py --root /path/to/project  # 指定项目根目录
"""

import argparse
import os
import shutil
import sys


class ProjectCleaner:
    def __init__(self, root, dry_run=False):
        self.root = root
        self.dry_run = dry_run
        self.deleted_files = []
        self.modified_files = []
        self.skipped_files = []

    def log(self, message):
        prefix = "[dry-run] " if self.dry_run else ""
        print(f"{prefix}{message}")

    # ------------------------------------------------------------------
    # 文件操作
    # ------------------------------------------------------------------
    def remove_path(self, rel_path):
        """删除文件或目录（不存在时安全跳过）"""
        abs_path = os.path.join(self.root, rel_path)

        if not os.path.exists(abs_path):
            self.skipped_files.append(rel_path)
            return

        if self.dry_run:
            self.log(f"将删除: {rel_path}")
        else:
            if os.path.isdir(abs_path):
                shutil.rmtree(abs_path)
            else:
                os.remove(abs_path)
            self.log(f"已删除: {rel_path}")

        self.deleted_files.append(rel_path)

    def replace_in_file(self, rel_path, replacements):
        """
        精确字符串替换
        :param rel_path: 相对路径
        :param replacements: [(old, new), ...] 列表
        """
        abs_path = os.path.join(self.root, rel_path)

        if not os.path.exists(abs_path):
            self.skipped_files.append(rel_path)
            return

        with open(abs_path, "r", encoding="utf-8") as fp:
            content = fp.read()

        original = content
        for old, new in replacements:
            if old in content:
                content = content.replace(old, new)

        if content == original:
            self.skipped_files.append(rel_path)
            return

        if self.dry_run:
            self.log(f"将修改: {rel_path}")
        else:
            with open(abs_path, "w", encoding="utf-8", newline="") as fp:
                fp.write(content)
            self.log(f"已修改: {rel_path}")

        self.modified_files.append(rel_path)

    # ------------------------------------------------------------------
    # 清理步骤
    # ------------------------------------------------------------------
    def run(self):
        print("=" * 50)
        print("Vue Admin 项目模板清理")
        print(f"项目根目录: {self.root}")
        print("=" * 50)

        # 1. 删除演示文件
        self.remove_path("src/pages/demo")
        self.remove_path("src/pages/content")
        self.remove_path("src/components/Github")
        self.remove_path("src/servers/content")
        self.remove_path("src/menus/demo.ts")
        self.remove_path("src/locales/zh/content.ts")
        self.remove_path("src/locales/en/content.ts")

        # 2. 修改 Header.vue（移除 Github）
        self.replace_in_file(
            "src/layouts/components/Header.vue",
            [
                ("import Github from '@/components/Github/index.vue';\n", ""),
                ("      <Github />\n", ""),
            ],
        )

        # 3. 修改 menus/index.ts（移除 demo 引用）
        self.replace_in_file(
            "src/menus/index.ts",
            [
                ("import { demo } from './demo';\n", ""),
                ("  ...(demo as SideMenu[]),\n", ""),
            ],
        )

        # 汇总
        print("=" * 50)
        print(f"删除: {len(self.deleted_files)} 项")
        print(f"修改: {len(self.modified_files)} 项")
        print(f"跳过: {len(self.skipped_files)} 项（不存在或无匹配）")
        print("=" * 50)

        if self.dry_run:
            print("这是预览模式（--dry-run），未实际修改任何文件")


def main():
    parser = argparse.ArgumentParser(description="Vue Admin 项目模板清理")
    parser.add_argument("--dry-run", action="store_true", help="预览模式，不实际修改文件")
    parser.add_argument("--root", default=".", help="项目根目录（默认当前目录）")
    args = parser.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(os.path.join(root, "src")):
        print(f"错误: {root} 不是有效的项目根目录（未找到 src 目录）")
        sys.exit(1)

    cleaner = ProjectCleaner(root, dry_run=args.dry_run)
    cleaner.run()


if __name__ == "__main__":
    main()
