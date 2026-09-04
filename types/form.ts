import type {
  InputProps,
  InputNumberProps,
  SelectProps,
  TreeSelectProps,
  RadioProps,
  DatePickerProps,
  TimePickerProps,
  UploadProps,
  RateProps,
  SliderProps,
  CheckboxProps,
  SwitchProps,
  TransferProps,
  FormItemProps,
} from 'ant-design-vue';
import type { CSSProperties, VNodeChild } from 'vue';
import type { DefaultOptionType } from 'ant-design-vue/es/select';
import type { RuleObject } from 'ant-design-vue/es/form';
import type { ServerResult } from '@/servers/request';
import type { ApiSelectProps, ApiTreeSelectProps, ApiPageSelectProps } from '@/components/Selects/types';
import type { BusinessComponents } from '@/components/Business';
import type { WangEditorProps } from '@/components/WangEditor/model';

// 数据类型
export type BaseFormData = Record<string, unknown>;

// 基础数据组件
type DefaultDataComponents =
  | 'Input'
  | 'InputNumber'
  | 'TextArea'
  | 'InputPassword'
  | 'AutoComplete'
  | 'customize';

// 下拉组件
type SelectComponents = 'Select' | 'TreeSelect' | 'ApiSelect' | 'ApiTreeSelect' | 'ApiPageSelect';

// 复选框组件
type CheckboxComponents = 'Checkbox' | 'CheckboxGroup';

// 单选框组件
type RadioComponents = 'RadioGroup' | 'Switch';

// 时间组件
type TimeComponents = 'DatePicker' | 'RangePicker' | 'TimePicker' | 'TimeRangePicker';

// 上传组件
type UploadComponents = 'Upload';

// 星级组件
type RateComponents = 'Rate';

// 穿梭框组件
type TransferComponents = 'Transfer';

// 滑动输入条组件
type SliderComponents = 'Slider';

// 自定义组件
type CustomizeComponents = 'Customize';

// 富文本编辑器
type EditorComponents = 'Editor';

// 密码强度组件
type PasswordStrengthComponents = 'PasswordStrength';

// 插槽组件（Vue 模板自定义渲染）
type SlotComponents = 'slot';

// 组件集合
export type ComponentType =
  | DefaultDataComponents
  | SelectComponents
  | CheckboxComponents
  | TimeComponents
  | RadioComponents
  | CustomizeComponents
  | UploadComponents
  | RateComponents
  | SliderComponents
  | EditorComponents
  | PasswordStrengthComponents
  | TransferComponents
  | SlotComponents
  | BusinessComponents;

export interface ApiResult extends Omit<DefaultOptionType, 'value'> {
  label: VNodeChild;
  title?: VNodeChild;
  key?: string | number;
  value?: string | number;
}

// api函数
export type ApiFn = {
  <T extends unknown[]>(...params: T): Promise<ServerResult<unknown>>;
};

// 组件参数
export type ComponentProps = (
  | InputProps
  | InputNumberProps
  | SelectProps
  | TreeSelectProps
  | CheckboxProps
  | RadioProps
  | DatePickerProps
  | TimePickerProps
  | UploadProps
  | RateProps
  | SliderProps
  | TransferProps
  | SwitchProps
  | ApiSelectProps
  | ApiTreeSelectProps
  | ApiPageSelectProps
  | WangEditorProps
) & {
  style?: CSSProperties;
  maxLength?: number;
};

// 组件渲染参数（render 函数入参）
export type RenderComponentProps = InputProps &
  InputNumberProps &
  SelectProps &
  TreeSelectProps &
  CheckboxProps &
  RadioProps &
  DatePickerProps &
  TimePickerProps &
  UploadProps &
  RateProps &
  SliderProps &
  TransferProps &
  ApiSelectProps &
  ApiTreeSelectProps &
  ApiPageSelectProps;

// 表单规则
export type FormRule = RuleObject & {
  trigger?: 'blur' | 'change' | ('change' | 'blur')[];
};

// 表单自定义渲染类型
export type CustomizeRender = (props: RenderComponentProps) => VNodeChild;

// 表单数据
export interface BaseFormList extends FormItemProps {
  name: string | string[]; // 表单域字段
  label: string; // 标签
  placeholder?: string; // 占位符
  hidden?: boolean; // 是否隐藏
  unit?: string; // 单位，无法和extra一起显示
  rules?: FormRule[]; // 规则
  labelWidth?: number; // label宽度
  wrapperWidth?: number; // 内容宽度
  component: ComponentType; // 组件
  componentProps?: ComponentProps; // 组件参数
  render?: CustomizeRender; // 自定义渲染
  slot?: string; // 插槽名（component 为 slot 时使用）
}

// 搜索数据
export interface BaseSearchList extends BaseFormList {
  labelWidth?: number;
}
