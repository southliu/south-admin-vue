import type { BaseFormList, BaseSearchList } from '#/form';
import type { TableColumn } from '#/public';
import type { Translate } from '@/utils/config';
import { FORM_REQUIRED } from '@/utils/config';
import { h } from 'vue';
import AuthorizeSelect from './components/AuthorizeSelect.vue';

// 搜索数据
export const searchList = (t: Translate): BaseSearchList[] => [
  {
    label: t('public.name'),
    name: 'name',
    component: 'Input',
  },
];

/**
 * 表格数据
 */
export const tableColumns = (t: Translate): TableColumn[] => {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 200,
    },
    {
      title: t('public.name'),
      dataIndex: 'name',
      width: 200,
    },
    {
      title: t('system.description'),
      dataIndex: 'description',
      width: 200,
    },
    {
      title: t('public.creationTime'),
      dataIndex: 'createdAt',
      width: 200,
    },
    {
      title: t('public.updateTime'),
      dataIndex: 'updatedAt',
      width: 200,
    },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 200,
      fixed: 'right',
    },
  ];
};

/**
 * 新增数据
 * @param t - 翻译函数
 * @param id - 编辑id
 */
export const createList = (t: Translate, id: string): BaseFormList[] => [
  {
    label: t('public.name'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('system.description'),
    name: 'description',
    component: 'TextArea',
  },
  {
    label: t('system.authorize'),
    name: 'authorize',
    rules: FORM_REQUIRED,
    component: 'customize',
    render: () => h(AuthorizeSelect, { id }),
  },
];
