import type { RouteRecordRaw } from 'vue-router';

/** 路由排除项（目录/文件名包含这些字符串则不注册为路由） */
export const ROUTER_EXCLUDE = ['login', 'forget', 'components', 'utils', 'lib', 'hooks', 'model.ts', '404.vue', '403.vue'];

/**
 * 路径分段首字母大写
 * @param path - 路由路径
 */
export function pathToPascalName(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      // 动态参数 :id -> Id
      const name = segment.startsWith(':') ? segment.slice(1) : segment;
      return name.charAt(0).toUpperCase() + name.slice(1);
    })
    .join('');
}

/**
 * 处理pages目录为路由数据
 * @param modules - import.meta.glob返回的模块表
 */
export function handleRoutes(modules: Record<string, () => Promise<unknown>>): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];

  for (const filePath in modules) {
    // ../pages/system/user/index.vue -> /system/user
    let routePath = filePath.replace('../pages', '').replace(/\.vue$/, '');

    // 去除结尾index
    if (routePath.endsWith('/index')) {
      routePath = routePath.slice(0, -'/index'.length);
    }

    // 动态路由参数 [option] -> :option
    routePath = routePath.replace(/\[(\w+)\]/g, ':$1');

    // 排除项
    if (ROUTER_EXCLUDE.some((exclude) => filePath.includes(exclude))) continue;

    // 根页面单独处理（pages/index.vue -> /）
    if (routePath === '') continue;

    routes.push({
      path: routePath,
      name: pathToPascalName(routePath),
      component: modules[filePath],
    } as RouteRecordRaw);
  }

  return routes;
}
