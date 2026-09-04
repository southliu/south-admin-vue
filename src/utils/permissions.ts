import type { PagePermission } from '#/public';

/**
 * 检测页面权限（按钮级）
 * @param value - 页面权限前缀，如 /system/user
 * @param permissions - 权限列表
 */
export const checkPermission = (value: string, permissions: string[]): PagePermission => {
  const result: PagePermission = {};

  // 页面权限
  if (permissions.includes(`${value}/index`) || permissions.includes(`${value}`)) {
    result.page = true;
  }

  // 新增权限
  if (permissions.includes(`${value}/create`)) {
    result.create = true;
  }

  // 编辑权限
  if (permissions.includes(`${value}/update`)) {
    result.update = true;
  }

  // 删除权限
  if (permissions.includes(`${value}/delete`)) {
    result.delete = true;
  }

  // 详情权限
  if (permissions.includes(`${value}/detail`)) {
    result.detail = true;
  }

  // 导出权限
  if (permissions.includes(`${value}/export`)) {
    result.export = true;
  }

  return result;
};

/**
 * 是否拥有某个权限
 * @param value - 权限值
 * @param permissions - 权限列表
 */
export const hasPermission = (value: string, permissions: string[]): boolean => {
  return permissions.includes(value);
};
