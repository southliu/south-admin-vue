import { MENU_LENGTH } from '@/utils/fieldLimits';
import type { BaseFormList, BaseSearchList } from '#/form';
import type { TableColumn } from '#/public';
import type { Translate } from '@/utils/config';
import { EMPTY_VALUE, FORM_REQUIRED } from '@/utils/config';
import { MENU_ACTIONS, MENU_STATUS, MENU_TYPES } from '@/utils/constants';
import { getMenuList } from '@/servers/system/menu';
import { h } from 'vue';
import { Icon } from '@iconify/vue';
import IconInput from './components/IconInput.vue';
import StateSwitch from './components/StateSwitch.vue';

// 搜索数据
export const searchList = (t: Translate): BaseSearchList[] => [
  {
    label: t('systems.menu.label'),
    name: 'label',
    component: 'Input',
    componentProps: { maxLength: MENU_LENGTH.label },
  },
  {
    label: t('systems.menu.labelEn'),
    name: 'labelEn',
    component: 'Input',
    componentProps: { maxLength: MENU_LENGTH.labelEn },
  },
  {
    label: t('system.state'),
    name: 'state',
    wrapperWidth: 100,
    component: 'Select',
    componentProps: {
      options: MENU_STATUS(t),
    },
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
      width: 100,
    },
    {
      title: t('systems.menu.icon'),
      dataIndex: 'icon',
      width: 50,
      customRender: ({ text }) =>
        h('div', { class: 'text-center' }, [
          text
            ? h(Icon, { icon: String(text), class: 'text-16px' })
            : EMPTY_VALUE,
        ]),
    },
    {
      title: t('systems.menu.label'),
      dataIndex: 'label',
      width: 200,
    },
    {
      title: t('systems.menu.labelEn'),
      dataIndex: 'labelEn',
      width: 200,
    },
    {
      title: t('public.type'),
      dataIndex: 'type',
      width: 60,
      ellipsis: false,
      enum: MENU_TYPES(t),
    },
    {
      title: t('systems.menu.router'),
      dataIndex: 'router',
      width: 200,
    },
    {
      title: t('system.status'),
      dataIndex: 'state',
      width: 80,
      customRender: ({ text, record }) =>
        h(StateSwitch, {
          value: text as number,
          record: record as { id: string; label: string; labelEn: string },
        }),
    },
    {
      title: t('systems.menu.sort'),
      dataIndex: 'order',
      width: 50,
    },
    {
      title: t('systems.menu.rule'),
      dataIndex: 'rule',
      width: 150,
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
      width: 210,
      fixed: 'right',
    },
  ];
};

/**
 * 新增数据
 * @param t - 翻译函数
 * @param id - 编辑id
 * @param type - 菜单类型
 */
export const createList = (
  t: Translate,
  id: string,
  type?: number,
): BaseFormList[] => [
  {
    label: t('systems.menu.parentMenu'),
    name: 'parentId',
    component: 'ApiTreeSelect',
    componentProps: {
      api: getMenuList,
      fieldNames: { label: 'label', value: 'id' },
    },
  },
  {
    label: t('systems.menu.label'),
    name: 'label',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: { maxLength: MENU_LENGTH.label },
  },
  {
    label: t('systems.menu.labelEn'),
    name: 'labelEn',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: { maxLength: MENU_LENGTH.labelEn },
  },
  {
    label: t('public.type'),
    name: 'type',
    rules: FORM_REQUIRED,
    component: 'RadioGroup',
    componentProps: {
      options: MENU_TYPES(t),
    },
  },
  {
    label: t('systems.menu.router'),
    name: 'router',
    rules: [{ required: type !== 3 }],
    component: 'Input',
    componentProps: { maxLength: MENU_LENGTH.router },
  },
  {
    label: t('system.state'),
    name: 'state',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      options: MENU_STATUS(t),
    },
  },
  {
    label: t('systems.menu.sort'),
    name: 'order',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
  },
  {
    label: t('systems.menu.rule'),
    name: 'rule',
    rules: [{ required: type === 3 }],
    component: 'Input',
    componentProps: { maxLength: MENU_LENGTH.rule },
  },
  {
    label: t('systems.menu.icon'),
    name: 'icon',
    componentProps: { maxLength: MENU_LENGTH.icon },
    component: 'customize',
    render: (props) => h(IconInput, props),
  },
  {
    label: t('system.permissionButton'),
    name: 'actions',
    hidden: !!id && type !== 3,
    component: 'CheckboxGroup',
    componentProps: {
      options: MENU_ACTIONS(t),
    },
  },
];
