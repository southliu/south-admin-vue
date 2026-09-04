<script setup lang="ts">
import type { BaseFormData, BaseFormList } from '#/form';
import type { FormInstance } from 'ant-design-vue';
import { Form } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { reactive, useTemplateRef, watch } from 'vue';
import { getComponent } from './utils/componentMap';
import { filterEmptyStr, filterFormItem, handleValuePropName } from './utils/helper';
import { filterDayjs, toControlValue } from '../Dates/utils/helper';

defineOptions({ name: 'BaseForm' });

const props = withDefaults(
  defineProps<{
    list: BaseFormList[];
    data?: BaseFormData;
    labelCol?: { span?: number };
    wrapperCol?: { span?: number };
  }>(),
  {
    data: () => ({}),
  },
);

const emit = defineEmits<{
  (e: 'handleFinish', values: Record<string, unknown>): void;
}>();

const { t } = useI18n();
const formRef = useTemplateRef<FormInstance>('formRef');

// 表单数据模型（值存在该对象中，Form.Item 通过 name 关联校验）
const formModel = reactive<Record<string, unknown>>({});

/**
 * 获取字段名（嵌套字段转路径字符串）
 */
const nameOf = (item: BaseFormList): string[] => {
  return Array.isArray(item.name) ? item.name : [item.name];
};

/**
 * 读取嵌套值
 */
const getIn = (obj: Record<string, unknown>, path: string[]) => {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

/**
 * 写入嵌套值
 */
const setIn = (obj: Record<string, unknown>, path: string[], value: unknown) => {
  let current = obj as Record<string, unknown>;
  for (let i = 0; i < path.length - 1; i++) {
    if (typeof current[path[i]] !== 'object' || current[path[i]] === null) {
      current[path[i]] = {};
    }
    current = current[path[i]] as Record<string, unknown>;
  }
  current[path[path.length - 1]] = value;
};

// 监听传入表单数据，如果变化则替换表单
watch(
  () => props.data,
  (value) => {
    // 清空旧值
    Object.keys(formModel).forEach((key) => delete formModel[key]);
    if (value) {
      Object.assign(formModel, value);
    }
    formRef.value?.clearValidate();
  },
  { immediate: true, flush: 'post' },
);

// 校验消息模板
const validateMessages = {
  required: t('public.requiredForm', { label: '${label}' }),
  types: {
    email: t('public.validateEmail', { label: '${label}' }),
    number: t('public.validateNumber', { label: '${label}' }),
  },
  number: {
    range: t('public.validateRange', { label: '${label}', max: '${max}', min: '${min}' }),
  },
};

/**
 * 控件值变化处理
 * @param item - 表单项
 */
const handleChange = (item: BaseFormList) => {
  return (value: unknown, ...rest: unknown[]) => {
    // 上传组件取fileList
    let actualValue = value;
    if (item.component === 'Upload') {
      actualValue = Array.isArray(value) ? value : (value as { fileList?: unknown[] })?.fileList;
    }
    setIn(formModel, nameOf(item), actualValue);
    (item.componentProps as { onChange?: (...args: unknown[]) => void } | undefined)?.onChange?.(
      value,
      ...rest,
    );
  };
};

/**
 * 控件绑定属性（value/checked/fileList + 双向事件）
 * @param item - 表单项
 */
const controlBindings = (item: BaseFormList) => {
  const valueProp = handleValuePropName(item.component);
  const path = nameOf(item);
  const result: Record<string, unknown> = {
    [valueProp]: toControlValue(item.component, getIn(formModel, path)),
    [`onUpdate:${valueProp}`]: handleChange(item),
    onChange: handleChange(item),
  };

  // 富文本编辑器兼容 v-model:modelValue
  if (item.component === 'Editor') {
    result['onUpdate:modelValue'] = handleChange(item);
  }

  return result;
};

/**
 * 提交表单
 * @param values - 表单值
 */
const onFinish = (values: Record<string, unknown>) => {
  // 将dayjs类型转为字符串
  let params = filterDayjs({ ...values }, props.list);
  // 过滤空字符串和前后空格
  params = filterEmptyStr(params);
  emit('handleFinish', params);
};

/**
 * 表单提交失败处理
 * @param errorInfo - 错误信息
 */
const onFinishFailed = (errorInfo: unknown) => {
  console.warn('表单错误:', errorInfo);
};

/** 触发表单提交（requestSubmit 会触发表单校验流程） */
const submit = () => {
  const el = formRef.value?.$el as HTMLFormElement | undefined;
  if (el?.requestSubmit) {
    el.requestSubmit();
  }
};

/** 重置表单 */
const resetFields = () => {
  formRef.value?.resetFields();
  Object.keys(formModel).forEach((key) => delete formModel[key]);
};

/** 设置表单值 */
const setFieldsValue = (values: Record<string, unknown>) => {
  Object.assign(formModel, values);
};

defineExpose({
  submit,
  resetFields,
  setFieldsValue,
  formModel,
  validate: (...args: Parameters<FormInstance['validate']>) => formRef.value?.validate(...args),
});
</script>

<template>
  <Form
    ref="formRef"
    :model="formModel"
    v-bind="$attrs"
    :label-col="labelCol || { span: 6 }"
    :wrapper-col="wrapperCol || { span: 18 }"
    :validate-messages="validateMessages"
    @finish="onFinish"
    @finish-failed="onFinishFailed"
    autocomplete="off"
  >
    <template v-for="item in list" :key="String(item.name)">
      <!-- 单位模式 -->
      <Form.Item v-if="item.unit" :label="item.label">
        <div class="flex items-center">
          <Form.Item v-bind="filterFormItem({ ...item, label: '' } as never)" no-style>
            <component :is="getComponent(t, item)" v-bind="controlBindings(item)" />
          </Form.Item>
          <span class="ml-5px whitespace-nowrap">{{ item.unit }}</span>
        </div>
      </Form.Item>

      <!-- 插槽模式 -->
      <Form.Item
        v-else-if="item.component === 'slot'"
        v-bind="filterFormItem(item)"
        :value-prop-name="handleValuePropName(item.component)"
      >
        <slot :name="item.slot" :item="item" :model="formModel" />
      </Form.Item>

      <!-- 常规模式 -->
      <Form.Item v-else v-bind="filterFormItem(item)">
        <component :is="getComponent(t, item)" v-bind="controlBindings(item)" />
      </Form.Item>
    </template>

    <slot />
  </Form>
</template>
