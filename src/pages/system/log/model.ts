import type { BaseSearchList } from '#/form';
import type { TableColumn } from '#/public';
import type { Translate } from '@/utils/config';
import { h } from 'vue';

// 日志数据类型
export interface LogItem {
  id: string;
  username: string;
  ip: string;
  method: string;
  url: string;
  params: string;
  userAgent: string;
  status: string;
  error: string;
  latency: number;
  type: number;
  createdAt: string;
  updatedAt: string;
}

// 搜索数据
export const searchList = (t: Translate): BaseSearchList[] => [
  {
    label: t('log.username'),
    name: 'username',
    wrapperWidth: 200,
    component: 'Input',
  },
  {
    label: t('log.ip'),
    name: 'ip',
    wrapperWidth: 200,
    component: 'Input',
  },
  {
    label: t('log.method'),
    name: 'method',
    wrapperWidth: 150,
    component: 'Select',
    componentProps: {
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' },
      ],
      allowClear: true,
    },
  },
  {
    label: t('log.status'),
    name: 'status',
    wrapperWidth: 150,
    component: 'Select',
    componentProps: {
      options: [
        { label: '200', value: '200' },
        { label: '201', value: '201' },
        { label: '204', value: '204' },
        { label: '400', value: '400' },
        { label: '401', value: '401' },
        { label: '403', value: '403' },
        { label: '404', value: '404' },
        { label: '500', value: '500' },
        { label: '502', value: '502' },
        { label: '503', value: '503' },
        { label: 'error', value: 'error' },
      ],
      allowClear: true,
    },
  },
  {
    label: t('log.type'),
    name: 'type',
    wrapperWidth: 150,
    component: 'Select',
    componentProps: {
      options: [
        { label: t('log.success'), value: 1 },
        { label: t('log.error'), value: 0 },
        { label: t('log.frontend'), value: 3 },
      ],
      allowClear: true,
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
      title: t('log.username'),
      dataIndex: 'username',
      width: 120,
    },
    {
      title: t('log.ip'),
      dataIndex: 'ip',
      width: 140,
    },
    {
      title: t('log.method'),
      dataIndex: 'method',
      width: 90,
      customRender: ({ text }) => {
        const colorMap: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple',
        };
        const color = colorMap[String(text)] || 'default';
        return h('span', { style: { color, fontWeight: 500 } }, String(text));
      },
    },
    {
      title: t('log.url'),
      dataIndex: 'url',
      width: 300,
      ellipsis: true,
    },
    {
      title: t('log.params'),
      dataIndex: 'params',
      width: 200,
      ellipsis: true,
      customRender: ({ text }) => {
        if (!text) return '-';
        try {
          const parsed = JSON.parse(String(text));
          return `${JSON.stringify(parsed).slice(0, 50)}...`;
        } catch {
          return `${String(text).slice(0, 50)}...`;
        }
      },
    },
    {
      title: t('log.userAgent'),
      dataIndex: 'userAgent',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('log.status'),
      dataIndex: 'status',
      width: 100,
    },
    {
      title: t('log.latency'),
      dataIndex: 'latency',
      width: 100,
      customRender: ({ text }) => `${text}ms`,
    },
    {
      title: t('log.type'),
      dataIndex: 'type',
      width: 90,
      enum: [
        { label: t('log.error'), value: 0, color: 'red', type: 'tag' },
        { label: t('log.success'), value: 1, color: 'green', type: 'tag' },
        { label: t('log.frontend'), value: 3, color: 'red', type: 'tag' },
      ],
    },
    {
      title: t('log.error'),
      dataIndex: 'error',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('public.creationTime'),
      dataIndex: 'createdAt',
      width: 170,
    },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 100,
      fixed: 'right',
    },
  ];
};
