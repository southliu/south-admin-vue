import type { BaseSearchList } from '#/form';
import type { TableColumn } from '#/public';

export const searchList: BaseSearchList[] = [
  {
    label: '采集来源',
    name: 'sourcePlatform',
    wrapperWidth: 150,
    component: 'Select',
    componentProps: {
      options: [
        { label: '钉钉', value: 'dingtalk' },
        { label: '企业微信', value: 'wecom' },
      ],
      allowClear: true,
    },
  },
  {
    label: '记录类型',
    name: 'recordType',
    wrapperWidth: 150,
    component: 'Select',
    componentProps: {
      options: [
        { label: '入职', value: 'onboarding' },
        { label: '请假', value: 'leave' },
        { label: '离职', value: 'resignation' },
      ],
      allowClear: true,
    },
  },
  {
    label: '姓名',
    name: 'applicantName',
    wrapperWidth: 160,
    component: 'Input',
  },
  {
    label: '审批状态',
    name: 'status',
    wrapperWidth: 160,
    component: 'Input',
  },
  {
    label: '采集开始',
    name: 'dateFrom',
    wrapperWidth: 150,
    component: 'DatePicker',
    componentProps: { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' },
  },
  {
    label: '采集结束',
    name: 'dateTo',
    wrapperWidth: 150,
    component: 'DatePicker',
    componentProps: { format: 'YYYY-MM-DD', valueFormat: 'YYYY-MM-DD' },
  },
];

export const tableColumns: TableColumn[] = [
  {
    title: '来源',
    dataIndex: 'sourcePlatform',
    width: 100,
    fixed: 'left',
    enum: [
      { label: '钉钉', value: 'dingtalk', color: 'blue', type: 'tag' },
      { label: '企业微信', value: 'wecom', color: 'green', type: 'tag' },
    ],
  },
  {
    title: '类型',
    dataIndex: 'recordType',
    width: 90,
    enum: [
      { label: '入职', value: 'onboarding', color: 'green', type: 'tag' },
      { label: '请假', value: 'leave', color: 'blue', type: 'tag' },
      { label: '离职', value: 'resignation', color: 'orange', type: 'tag' },
    ],
  },
  { title: '姓名', dataIndex: 'applicantName', width: 110, fixed: 'left' },
  { title: '手机号', dataIndex: 'mobile', width: 130 },
  { title: '公司主体', dataIndex: 'company', width: 220 },
  { title: '部门', dataIndex: 'department', width: 210 },
  { title: '岗位', dataIndex: 'position', width: 130 },
  { title: '员工类型', dataIndex: 'employeeType', width: 110 },
  { title: '请假类型', dataIndex: 'leaveType', width: 110 },
  { title: '开始时间', dataIndex: 'startTime', width: 165 },
  { title: '结束时间', dataIndex: 'endTime', width: 165 },
  { title: '时长', dataIndex: 'durationValue', width: 80 },
  { title: '单位', dataIndex: 'durationUnit', width: 70 },
  { title: '入职日期', dataIndex: 'entryDate', width: 110 },
  { title: '离职日期', dataIndex: 'effectiveDate', width: 110 },
  { title: '原因/事由', dataIndex: 'reason', width: 240, ellipsis: true },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    customRender: ({ text }) => String(text || '-').replace(/^审批完[（(]?/, '').replace(/[）)]$/, ''),
  },
  { title: '审批编号', dataIndex: 'approvalNo', width: 210 },
  { title: '采集时间', dataIndex: 'collectedAt', width: 170 },
];
