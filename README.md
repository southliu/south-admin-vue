## ✨ 简介

使用`Vue3`,`Vite`,`TypeScript`,`Ant Design Vue`等主流技术开发的开箱即用的中后台前端项目，支持`keepalive`功能，`Vite`自动生成路由，`pinia`状态管理，`vxe-table`虚拟滚动表格，`UnoCss`开发样式。

## 🚀 项目演示
[演示地址](https://southliu.top)

## 💻 安装使用

- 获取项目代码í

```bash
git clone https://github.com/southliu/vue-admin.git
```

- 选择目录

```bash
cd vue-admin
```

- 安装全局依赖依赖，存在则不用安装

```bash
npm i -g pnpm
```

- 安装依赖

```bash
pnpm install
```

- 运行

```bash
pnpm dev
```

- 打包

```bash
pnpm build
```

## 🧩 图标(iconify)

- 参考 [iconify官方地址](https://icon-sets.iconify.design/)
- VS Code安装Iconify IntelliSense - 图标内联显示和自动补全

## 🎗️ Git 提交示例
### Git提交不规范会导致无法提交，`feat`关键字可以按照下面`Git 贡献提交规范`来替换。
```
git add .
git commit -m "feat: 新增功能"
git push
```

## 🎯 Git 贡献提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范

  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中

- 如果无法运行commitlint，请运行以下指令：

```
  npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

## 💡 计划

- [x] 主题换肤功能
- [ ] i18n语言切换
- [x] 表单嵌套结构
- [x] 包分析工具
- [x] cli生成增删改查
- [x] 剪切板功能
- [x] 富文本组件
- [x] 虚拟滚动组件
- [x] 水印组件
- [x] 密码强度显示
- [x] 内容最大化功能
- [x] 404错误页
- [x] 封装文档说明
- [x] 密码规则
- [x] 弹窗拖拽功能
- [x] 弹窗最大化功能
- [x] Icon封装
- [x] 标签页右键功能
- [x] 搜索菜单功能

## 🐓 keep-alive说明：
### 如果需要使用keep-alive功能则需要文件名里面添加name即可。
```ts
/**
 * 需要通过路径转换成对应的name
 * /system/user => SystemUser
 * /content/article => ContentArticle
 */
defineOptions({
  name: 'SystemUser'
});
```

## 🐵 关于封装
  1. 功能扩展，在原有的api上拓展。
  2. 功能整合，合并两个或两个以上组件的api。
  3. 样式统一，避免后期样式变动，导致牵一发而动全身。

## 🤖 组件说明

### 表单(BasicForm):
| 属性名 | 必填 | 属性说明 |
| --- | --- | --- |
| name | 是 | 表单域字段，如果是嵌套格式，则为数组 |
| label | 是 | 表单标签 |
| rules | 否 | 表单规则，[参考模板](https://ant.design/components/form-cn/#components-form-demo-basic) |
| component | 是 | 组件名，参考Antv名称，如Input |
| componentProps | 否 | 组件属性，参考对应文档API，方法都是**on开头**，如dropdownVisibleChange要改为onDropdownVisibleChange |

### 表格(BasicTable):
| 属性名 | 必填 | 属性说明 |
| --- | --- | --- |
| id | 否 | 唯一标识(被某些特定的功能所依赖) |
| data | 是 | 表格数据 |
| columns | 是 | 列数据 |
| isLoading | 否 | 加载动画 |
| offsetHeight | 否 | 高度偏移差，当表格高度过高出现滚动条的时候使用 |
| isResize | 否 | 是否开启监听窗口变化而更改高度 |

### 分页器(BasicPagination):
| 属性名 | 必填 | 属性说明 |
| --- | --- | --- |
| total | 否 | 数据总数 |
| page | 是 | 当前页数 |
| pageSize | 是 | 每页条数 |
| isLoading | 否 | 加载动画 |

### API下拉框(ApiSelect、ApiTreeSelect):
| 属性名 | 必填 | 属性说明 |
| --- | --- | --- |
| value | 否 | 下拉框绑定值 |
| componentProps | 否 | 下拉框值，[ApiSelect属性](https://www.antdv.com/components/select-cn)，[ApiTreeSelect属性](https://www.antdv.com/components/tree-select-cn) |
| api | 是 | API接口 |
| params | 否 | 接口参数 |
| onDropdownVisibleChange | 否 | 展开下拉菜单的回调 |
### 自定义组件
#### 业务组件存放在`src/components/Business`目录下，每次新增组件想要在src/components/Business/index.tsx文件中引入。

## 2026-11 React 版同步

参考 `/Users/south/code/south-admin-react` 在 2026-10-27 至 2026-11-27 的提交：

| React 提交 | Vue 对应调整 |
| --- | --- |
| `4a04512` | `createWebHistory`，对应 React BrowserRouter；登录跳转保留编码后的查询参数 |
| `109f0fb`、`47ee509` | 构建版本同时注入 JS 和 version.json；全应用每 2 秒检查，1–3 秒随机倒计时，URL 版本参数防循环刷新 |
| `959d4ea` | 移除日志 IP 搜索和展示 |
| `5f94159` | ConfigProvider 与 Day.js 同步中英文 |
| `6ba0afe` | 表格保留完整文字，省略时可查看完整内容；标签标题提示 |
| `dffec15`、`a879078`、`18746a0` | 内容加载反馈、图标按需加载、现代 Vite 构建 |
| `6262a02`、`61166a4` | 请求取消清理、旧响应隔离、下拉选项防竞态、菜单折叠和刷新修复 |
| `3e17f60`、`9f8df03` | 移除隐式 API 自动导入与旧浏览器插件，包分析仅 REPORT=true 时启用 |
| `3a879d1` | HTTP 与业务 401 均提示服务端错误，旧会话请求不清除新登录 |

HR 页面与接口全部删除，保留 Git 历史。React 专用 Hooks、JSX、workspace 包拆分和其文档规则不直接移植。

运行环境：Node.js >= 22.12，pnpm 12。执行 `pnpm install`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build`。
依赖逐项核对 npm 最新版本；Vue 工具链按官方兼容要求使用 TypeScript 6 API，精确解析版本记录在 pnpm-lock.yaml。Vite 8 使用 Rolldown/Oxc 和 Baseline 浏览器目标。

### History 部署与版本更新

访问地址使用 `/system/user`，服务器需要将非静态资源路径回退至 index.html，参考 [Nginx 配置](deploy/nginx.conf)。静态资源不存在时应返回 404，不能返回 HTML。GitHub Pages 默认不支持此回退，需要额外配置托管层。

version.json 使用 Vite BASE_URL 根路径，禁止缓存；index.html 每次重新验证，带 hash 的 assets 可长期缓存。版本基于当前实际加载的 JS 构建标识比较，不使用 localStorage 首次响应作为基准。`__app_version` 是刷新防循环标识，搜索表单不会将它作为业务搜索条件。

`pnpm icons` 自动生成离线常用图标子集与 public/icons 集合；dev 和 build 会自动执行。完整图标集仅在菜单需要时从本站获取。

TypeScript 7 原生编译器通过 `typescript-native` 安装；`typescript` 按微软兼容方案别名到最新 `@typescript/typescript6`，为 vue-tsc、ESLint 和测试提供 Compiler API。不能将该兼容包直接替换成 TypeScript 7 的原生入口。

### 维护中的依赖替代

- 停维的 crypto-js 替换为 crypto-es 3.1.3，旧 AES 密文与 MD5 结果由回归测试验证兼容。
- 暂停维护的 wangEditor 替换为 wangEditor-next 6.7.0，并使用 Vue 3 官方包装器；与 React 版同步保留工具栏、HTML 输出、图片和视频上传接口。v6 的视频 HTML 使用 figure 容器，服务端若配置 HTML 白名单，需要允许 figure/data-w-e-align。
- 表单字段长度和密码 UTF-8 字节限制与 React 的 fieldLimits 保持一致。
