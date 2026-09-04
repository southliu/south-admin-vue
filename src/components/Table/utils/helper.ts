import type { TableColumn } from '#/public';

/**
 * 过滤表格列（去除隐藏列）
 * @param columns - 表格列
 */
export function filterTableColumns(columns?: TableColumn[]): TableColumn[] {
  return (columns || []).filter((item) => !(item as { hidden?: boolean }).hidden);
}

/**
 * 获取表格高度
 * @param element - 表格元素
 */
export function getTableHeight(element?: HTMLElement | null): number | undefined {
  if (!element) return undefined;

  const height = element.clientHeight;
  const header = element.querySelector('.ant-table-thead');
  const headerHeight = header?.clientHeight || 0;
  const pagination = element.querySelector('#pagination');
  const paginationHeight = pagination?.clientHeight || 0;

  return height - headerHeight - paginationHeight - 20;
}

/**
 * 处理行高
 */
export function handleRowHeight(): number {
  return 54;
}
