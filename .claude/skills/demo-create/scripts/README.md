# demo-create 代码生成脚本

## 用法

```bash
# 直接调用
python3 .claude/skills/demo-create/scripts/generate.py '<config_json>'

# 或使用包装脚本
bash .claude/skills/demo-create/scripts/run.sh '<config_json>'
```

配置 JSON 格式参见 `config.example.json`。

## 生成的文件

- `src/servers/{modulePath}.ts` — API 接口文件
- `src/pages/{modulePath}/model.ts` — 数据模型
- `src/pages/{modulePath}/index.vue` — 列表页面
- `src/pages/{modulePath}/[option].vue` — 操作页（仅 page 模式）
- `src/locales/zh/{moduleName}.ts` — 中文语言包（仅开启 i18n）
- `src/locales/en/{moduleName}.ts` — 英文语言包（仅开启 i18n）

## 环境要求

- Python 3.6+
- npx prettier（可选，用于格式化生成代码）
