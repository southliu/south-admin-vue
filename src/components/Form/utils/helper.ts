import type { FormItemProps } from 'ant-design-vue';
import type { ComponentProps, ComponentType, BaseFormList } from '#/form';
import type { Translate } from '@/utils/config';
import { DATE_FORMAT, TIME_PICKER_FORMAT } from '@/utils/config';

/**
 * 处理子节点的值的属性
 * @param component - 组件名
 */
export function handleValuePropName(component: ComponentType): string {
  switch (component) {
    case 'Switch':
      return 'checked';

    case 'Upload':
      return 'fileList';

    default:
      return 'value';
  }
}

/**
 * 初始化组件自定义属性
 * @param t - 翻译函数
 * @param component - 组件名
 */
export function initCompProps(t: Translate, component: ComponentType): ComponentProps {
  switch (component) {
    // 输入框
    case 'Input':
      return {
        allowClear: true,
        placeholder: t('public.inputPleaseEnter'),
      };

    // 下拉框
    case 'Select':
      return {
        allowClear: true,
        showSearch: true,
        placeholder: t('public.inputPleaseSelect'),
      };

    // 树形下拉框
    case 'TreeSelect':
      return {
        allowClear: true,
        showSearch: true,
        placeholder: t('public.inputPleaseSelect'),
      };

    // 数字框
    case 'InputNumber':
      return {
        placeholder: t('public.inputPleaseEnter'),
      };

    // 日期
    case 'DatePicker':
      return {
        placeholder: t('public.inputPleaseSelect'),
        format: DATE_FORMAT,
      };

    // 日期区间
    case 'RangePicker':
      return {
        placeholder: [t('public.inputPleaseSelect'), t('public.inputPleaseSelect')],
        format: [DATE_FORMAT, DATE_FORMAT],
      };

    // 时间
    case 'TimePicker':
      return {
        placeholder: t('public.inputPleaseSelect'),
        format: TIME_PICKER_FORMAT,
      };

    // 时间区间
    case 'TimeRangePicker':
      return {
        placeholder: [t('public.inputPleaseSelect'), t('public.inputPleaseSelect')],
        format: [TIME_PICKER_FORMAT, TIME_PICKER_FORMAT],
      };

    default:
      return {
        allowClear: true,
      };
  }
}

/**
 * 过滤表单数据
 * @param data - 表单数据
 */
export const filterFormItem = (data: BaseFormList): FormItemProps => {
  const result: Record<string, unknown> = { ...data };
  delete result.wrapperWidth;
  delete result.componentProps;
  delete result.render;
  delete result.slot;
  delete result.unit;
  delete result.labelWidth;

  // 如果当前项是隐藏且存在规则，则移除规则校验
  if (result.hidden && (result.rules as unknown[] | undefined)?.length) {
    result.rules = undefined;
  }

  return result as FormItemProps;
};

/**
 * 过滤空字符串和前后空格
 * @param values - 表单值
 */
export const filterEmptyStr = (values: Record<string, unknown>) => {
  const params: Record<string, unknown> = {};

  Object.keys(values).forEach((key) => {
    // 去除前后空格
    if (typeof values[key] === 'string') {
      values[key] = (values[key] as string)?.trim();
    }

    params[key] = values[key];
  });

  return params;
};
