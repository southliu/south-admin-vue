import type { BaseFormList, BaseSearchList, ApiFn } from '#/form';
import type { TableColumn } from '#/public';
import type { Translate } from '@/utils/config';
import { FORM_REQUIRED } from '@/utils/config';
import { MENU_STATUS } from '@/utils/constants';
import { getUserPage } from '@/servers/system/user';
import { getRoleList } from '@/servers/system/role';

// 展开演示字段（对齐 React 版，用于搜索区展开/收缩效果）
const otherSearch: BaseSearchList[] = [];

for (let i = 0; i < 32; i++) {
  otherSearch.push({
    label: `名称${i + 1}`,
    name: `label${i + 1}`,
    component: 'Input',
    componentProps: {
      maxLength: 200,
    },
  });
}

// 搜索数据
export const searchList = (t: Translate): BaseSearchList[] => [
  {
    label: t('login.username'),
    name: 'username',
    component: 'ApiPageSelect',
    componentProps: {
      api: getUserPage as ApiFn,
      apiResultKey: 'items',
      fieldNames: { label: 'username', value: 'username' },
      params: {
        page: 1,
        pageSize: 10,
      },
    },
  },
  {
    label: t('system.email'),
    name: 'email',
    component: 'Input',
  },
  {
    label: t('system.phone'),
    name: 'phone',
    component: 'Input',
  },
  ...otherSearch,
];

/**
 * 表格数据
 */
export const tableColumns = (t: Translate): TableColumn[] => {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: t('login.username'),
      dataIndex: 'username',
      width: 100,
      fixed: 'left',
    },
    {
      title: t('public.name'),
      dataIndex: 'name',
      width: 100,
    },
    {
      title: t('system.state'),
      dataIndex: 'status',
      width: 80,
      enum: MENU_STATUS(t),
    },
    {
      title: t('system.role'),
      dataIndex: 'rolesName',
      width: 200,
    },
    {
      title: t('system.phone'),
      dataIndex: 'phone',
      width: 150,
    },
    {
      title: t('system.email'),
      dataIndex: 'email',
      width: 200,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      width: 200,
    },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 240,
      fixed: 'right',
    },
  ];
};

/**
 * 新增数据
 * @param t - 翻译函数
 * @param isCreate - 是否新增（编辑时隐藏密码）
 */
export const createList = (t: Translate, isCreate: boolean): BaseFormList[] => [
  {
    label: t('login.username'),
    name: 'username',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('login.password'),
    name: 'password',
    hidden: !isCreate,
    rules: isCreate ? FORM_REQUIRED : undefined,
    component: 'InputPassword',
  },
  {
    label: t('public.name'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('system.role'),
    name: 'roleIds',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      mode: 'multiple',
      api: getRoleList,
      fieldNames: { label: 'name', value: 'id' },
    },
  },
  {
    label: t('system.state'),
    name: 'status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      options: MENU_STATUS(t),
    },
  },
  {
    label: t('system.phone'),
    name: 'phone',
    rules: [{ pattern: /^1[3456789]\d{9}$/, message: t('login.phoneNumberError') }],
    component: 'Input',
  },
  {
    label: t('system.email'),
    name: 'email',
    rules: [{ type: 'email' }],
    component: 'Input',
  },
];
