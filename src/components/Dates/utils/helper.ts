import type { Dayjs } from 'dayjs';
import type { DatePickerProps } from 'ant-design-vue';
import type { BaseFormData, BaseFormList } from '#/form';
import { DATE_FORMAT, TIME_PICKER_FORMAT } from '@/utils/config';
import dayjs from 'dayjs';

// 区间值
type EventValue<T> = T | null;
export type RangeValue<T> = [EventValue<T>, EventValue<T>] | null;

/**
 * dayjs类型转字符串类型
 * @param value - dayjs时间类型值
 */
export function dayjs2String(
  value: Dayjs | string,
  format = DATE_FORMAT,
): string {
  if (dayjs.isDayjs(value)) {
    return value.format(format);
  }
  return value;
}

/**
 * 字符串类型转dayjs类型
 * @param value - 字符串
 */
export function string2Dayjs(value: Dayjs | string | number): Dayjs {
  if (dayjs.isDayjs(value)) {
    return value;
  }

  // 如果是时间戳
  if (typeof value === 'number' && isFinite(value)) {
    return dayjs.unix(value);
  }

  return dayjs(value);
}

/**
 * dayjs数组类型转字符串类型
 * @param value - dayjs时间类型值
 */
export function dayjsRang2StringRang(
  value: RangeValue<Dayjs>,
  format = DATE_FORMAT,
) {
  if (!value) return undefined;

  if (
    value?.length > 1 &&
    dayjs.isDayjs(value?.[0]) &&
    dayjs.isDayjs(value?.[1])
  ) {
    return [value[0]!.format(format), value[1]!.format(format)];
  }
  return value;
}

/**
 * 控件绑定值转换：日期/时间组件的字符串值转为dayjs（对齐 React 版 BaseDatePicker 等包装组件行为）
 * @param component - 组件名
 * @param value - 表单存储值
 */
export function toControlValue(component: string, value: unknown): unknown {
  if (value === undefined || value === null) return value;

  switch (component) {
    case 'DatePicker':
    case 'TimePicker':
      return string2Dayjs(value as Dayjs | string | number);

    case 'RangePicker':
    case 'TimeRangePicker':
      return stringRang2DayjsRang(
        value as [string | number | Dayjs, string | number | Dayjs],
      );

    default:
      return value;
  }
}

/**
 * 字符串数组类型转dayjs数组类型
 * @param value - 字符串数组
 */
export function stringRang2DayjsRang(
  value: [string | number | Dayjs, string | number | Dayjs] | undefined,
): RangeValue<Dayjs> | undefined {
  if (!value) return undefined;

  return [string2Dayjs(value[0]), string2Dayjs(value[1])];
}

/**
 * 获取列表中该键值数据格式
 * @param list - 列表值
 * @param key - 键值
 */
function getListKeyParam(list: BaseFormList[], key: string): string {
  for (const item of list) {
    const name = Array.isArray(item.name) ? item.name.join('.') : item.name;
    if (name === key) {
      let format = DATE_FORMAT; // 默认日期选择器格式
      // 时间选择器则为HH:mm:ss
      if (['TimePicker', 'TimeRangePicker'].includes(item.component)) {
        format = TIME_PICKER_FORMAT;
      }
      // 有格式化数据则用格式化数据
      if ((item.componentProps as DatePickerProps)?.format) {
        format = (item.componentProps as DatePickerProps)?.format as string;
      }

      return format;
    }
  }

  return DATE_FORMAT;
}

/**
 * 将Dayjs转为字符串
 * @param obj - 检测对象
 * @param list - 列表值
 */
export function filterDayjs(
  obj: BaseFormData,
  list: BaseFormList[],
): Record<string, unknown> {
  // 获取自定义组件的key
  const customizeList = list
    .filter((item) => item.component === 'customize')
    .map((item) =>
      Array.isArray(item.name) ? item.name.join('.') : item.name,
    );

  for (const key in obj) {
    // 自定义组件不处理
    if (customizeList?.includes(key)) continue;

    // 判断是否是时间区间
    const rangeValue = obj[key] as [Dayjs, Dayjs];
    if (
      rangeValue?.length === 2 &&
      dayjs.isDayjs(rangeValue[0]) &&
      dayjs.isDayjs(rangeValue[1])
    ) {
      const format = getListKeyParam(list, key);
      obj[key] = dayjsRang2StringRang(rangeValue, format);
    }

    // 如果是Dayjs类型则转换成字符串
    if (obj?.[key] && dayjs.isDayjs(obj[key])) {
      const format = getListKeyParam(list, key);
      obj[key] = dayjs2String(obj[key] as Dayjs, format);
    }
  }

  return obj;
}
