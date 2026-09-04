import type { VNode } from 'vue';
import type { TableProps } from 'ant-design-vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import type { IConstant } from '@/utils/constants';

// 基础类型
export type BasicData = string | number | boolean;

// 数组
export type ArrayData = string[] | number[] | boolean[];

// 空值
export type EmptyData = null | undefined;

// 分页接口响应数据
export interface PageServerResult<T = unknown> {
  items: T;
  total: number;
}

// 分页请求参数
export interface PaginationData {
  page?: number;
  pageSize?: number;
}

// 侧边菜单（与后端 /system/menu/list 返回结构一致）
export interface SideMenu {
  id?: number | string;
  label: string;
  labelZh?: string;
  labelEn: string;
  key: string; // 路由路径
  value?: string;
  icon?: VNode | string; // iconify 图标名
  type?: number; // 1目录 2菜单 3按钮
  router?: string;
  rule?: string; // 路由权限
  order?: number;
  state?: number;
  parentId?: number | string;
  nav?: string[]; // 面包屑路径
  children?: SideMenu[];
}

// 页面权限
export interface PagePermission {
  page?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  [key: string]: boolean | undefined;
}

// 枚举显示类型
export type EnumShowType = 'text' | 'tag';

// 表格列表枚举
export interface ColumnsEnum {
  label: string;
  value: unknown;
  color?: string;
  type?: EnumShowType;
}

// 表格列数据
export interface TableColumn<T = Record<string, unknown>> extends Omit<ColumnType<T>, 'children'> {
  enum?: ColumnsEnum[] | Record<string, unknown>;
  children?: TableColumn<T>[];
  type?: 'index';
  echoArr?: IConstant[];
  tooltipKey?: string; // 提示文本键名
  isKeepFixed?: boolean; // 手机端默认关闭fixed，该属性开启fixed
}

// 表格参数
export interface BaseTableProps extends Omit<TableProps, 'columns' | 'rowKey'> {
  rowKey?: string;
  columns?: TableColumn[];
}

// 表格数据
export type TableData = Record<string, unknown>;

// 接口响应数据
export interface ServerResult<T = unknown> {
  code: number;
  message?: string;
  data: T;
}

// 搜索数据
export interface SearchData {
  data: Record<string, unknown>;
}

// 新增/编辑数据
export interface CreateData<T = Record<string, unknown>> {
  id: string | number;
  isOpen: boolean;
  title: string;
  data: T;
  type?: 'create' | 'update';
}

// 某个字段变为可选
export type PartialByKeys<T, K extends keyof T> = {
  [P in K]?: T[P];
} & Omit<T, K>;

// 某个字段变为必选
export type RequiredByKeys<T, K extends keyof T> = {
  [P in K]: T[P];
} & Omit<T, K>;
