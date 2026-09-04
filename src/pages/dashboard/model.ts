import type { ApiFn, BaseFormList } from '#/form';
import type { Translate } from '@/utils/config';
import { getPartnerDemo } from '@/servers/platform/partner';

// 搜索数据
export const searchList = (t: Translate): BaseFormList[] => [
  {
    label: t('public.date'),
    name: 'pay_date',
    component: 'RangePicker',
    componentProps: {
      allowClear: false,
    },
  },
  {
    label: t('dashboard.gameID'),
    name: 'game_ids',
    wrapperWidth: 200,
    component: 'GameSelect',
  },
  {
    label: t('dashboard.cooperativeCompany'),
    name: 'partners',
    wrapperWidth: 200,
    component: 'ApiSelect',
    componentProps: {
      api: getPartnerDemo as ApiFn,
      params: ['/platform/partner', { isAll: true }],
      fieldNames: {
        label: 'name',
        value: 'id',
      },
    },
  },
];
