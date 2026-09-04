import type { Translate } from './config';
import type { PartialByKeys } from '#/public';
import { LANG, TITLE_SUFFIX } from './config';

/**
 * 首字母大写
 * @param value - 值
 */
export const firstCapitalize = (value: string) => {
  return value.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
};

/**
 * 千分位格式化
 * @param value - 值
 */
export const amountFormatter = (value: string | number) => {
  if (!value) return '0';
  return String(value).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
};

/**
 * 随机数
 * @param min - 最小值
 * @param max - 最大值
 */
export const randomNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * 值转label
 * @param value - 值
 * @param list - 枚举列表
 */
export const valueToLabel = (value: unknown, list: { value: unknown; label: string }[]) => {
  return list.find((item) => item.value === value)?.label || '';
};

/**
 * 获取URL全部参数
 */
export const getUrlAllParam = () => {
  const result: Record<string, string> = {};
  const params = window.location.search.slice(1).split('&');

  for (const param of params) {
    const [key, value] = param.split('=');
    if (key) result[key] = decodeURIComponent(value || '');
  }

  return result;
};

/**
 * 获取URL单个参数
 * @param key - 参数名
 */
export const getUrlParam = (key: string) => {
  return getUrlAllParam()[key] || '';
};

/**
 * 过滤空值
 * @param data - 对象数据
 */
export const filterEmptyValue = <T extends Record<string, unknown>>(data: T) => {
  const result: Record<string, unknown> = {};

  for (const key in data) {
    const value = data[key];
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value;
    }
  }

  return result as PartialByKeys<T, keyof T>;
};

/**
 * 递归处理数据
 * @param data - 数据
 * @param callback - 回调
 * @param childrenName - 子级字段名
 */
export function recursiveData<T extends { children?: T[] }>(
  data: T[] | undefined,
  callback: (item: T, index: number, array: T[]) => void,
  childrenName = 'children',
) {
  if (!data?.length) return;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    callback(item, i, data);
    const children = (item as Record<string, unknown>)[childrenName] as T[] | undefined;
    if (children?.length) {
      recursiveData(children, callback, childrenName);
    }
  }
}

/**
 * 设置浏览器标题
 * @param t - 翻译函数
 * @param title - 标题
 */
export const setTitle = (t: Translate, title?: string) => {
  document.title = title ? `${title}-${TITLE_SUFFIX(t)}` : TITLE_SUFFIX(t);
};

/**
 * 获取当前语言
 */
export const getLanguage = (): string => {
  return localStorage.getItem(LANG) || 'zh';
};
