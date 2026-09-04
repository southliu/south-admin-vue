import type { Component, VNode } from 'vue';
import type { BaseFormList, ComponentType } from '#/form';
import type { Translate } from '@/utils/config';
import { defineAsyncComponent, h } from 'vue';
import { Input, InputNumber, Radio, Switch, Checkbox, Rate, Slider, AutoComplete } from 'ant-design-vue';
import { initCompProps } from './helper';
import {
  BaseDatePicker,
  BaseRangePicker,
  BaseTimePicker,
  BaseTimeRangePicker,
} from '@/components/Dates';

// 异步组件注册表（重依赖按需加载）
const asyncComponents = new Map<ComponentType, Component>();

asyncComponents.set('Select', defineAsyncComponent(() => import('@/components/Selects/BaseSelect.vue')));
asyncComponents.set('TreeSelect', defineAsyncComponent(() => import('@/components/Selects/BaseTreeSelect.vue')));
asyncComponents.set('ApiSelect', defineAsyncComponent(() => import('@/components/Selects/ApiSelect.vue')));
asyncComponents.set('ApiTreeSelect', defineAsyncComponent(() => import('@/components/Selects/ApiTreeSelect.vue')));
asyncComponents.set('ApiPageSelect', defineAsyncComponent(() => import('@/components/Selects/ApiPageSelect.vue')));
asyncComponents.set('PasswordStrength', defineAsyncComponent(() => import('@/components/PasswordStrength/index.vue')));
asyncComponents.set('Editor', defineAsyncComponent(() => import('@/components/WangEditor/index.vue')));
asyncComponents.set('Upload', defineAsyncComponent(() => import('@/components/Upload/BaseUpload.vue')));

// 业务组件注册表
const businessComponents = new Map<string, Component>();

// 同步组件注册表
const components = new Map<ComponentType, Component>();

components.set('TextArea', Input.TextArea);
components.set('InputPassword', Input.Password);
components.set('InputNumber', InputNumber);
components.set('AutoComplete', AutoComplete);
components.set('Checkbox', Checkbox);
components.set('CheckboxGroup', Checkbox.Group);
components.set('RadioGroup', Radio.Group);
components.set('Switch', Switch);
components.set('Rate', Rate);
components.set('Slider', Slider);
components.set('DatePicker', BaseDatePicker);
components.set('RangePicker', BaseRangePicker);
components.set('TimePicker', BaseTimePicker);
components.set('TimeRangePicker', BaseTimeRangePicker);

/**
 * 处理输入框组件多余参数
 * @param componentProps - 组件参数
 */
const handleInputProps = (componentProps?: Record<string, unknown>) => {
  const newComponentProps = { ...(componentProps || {}) } as Record<string, unknown>;
  delete newComponentProps?.children;
  delete newComponentProps?.api;
  delete newComponentProps?.apiResultKey;
  delete newComponentProps?.fieldNames;

  return newComponentProps;
};

/**
 * 获取组件 vnode
 * @param t - 翻译函数
 * @param item - 表单项
 */
export function getComponent(t: Translate, item: BaseFormList): VNode | null {
  const { component, componentProps, render } = item;

  // 输入框默认渲染
  const renderInput = () =>
    h(Input, {
      ...(initCompProps(t, 'Input') as Record<string, unknown>),
      ...handleInputProps(componentProps as Record<string, unknown>),
    });

  // 自定义渲染
  if (component === 'customize') {
    if (!render) return renderInput();
    return render({ ...(componentProps || {}) } as never) as VNode;
  }

  // 输入框直接渲染
  if (component === 'Input') {
    return renderInput();
  }

  // 业务组件
  const businessComp = businessComponents.get(component);
  if (businessComp) {
    return h(businessComp, {
      ...(initCompProps(t, component) as Record<string, unknown>),
      ...(componentProps as Record<string, unknown>),
    });
  }

  // 异步组件
  const asyncComp = asyncComponents.get(component);
  if (asyncComp) {
    return h(asyncComp, {
      ...(initCompProps(t, component) as Record<string, unknown>),
      ...(componentProps as Record<string, unknown>),
    });
  }

  // 同步组件
  const Comp = components.get(component);
  if (!Comp) return renderInput();

  return h(Comp, {
    ...(initCompProps(t, component) as Record<string, unknown>),
    ...(componentProps as Record<string, unknown>),
  });
}

/**
 * 添加组件
 * @param name - 组件名
 * @param component - 组件
 */
export function addComponent(name: string, component: Component): void {
  businessComponents.set(name, component);
}

/**
 * 删除组件
 * @param name - 组件名
 */
export function deleteComponent(name: string): void {
  businessComponents.delete(name);
}

// 业务组件注入（GameSelect / PartnerSelect 等）
import('@/components/Business').then(({ CreateBusiness }) => {
  CreateBusiness();
});
