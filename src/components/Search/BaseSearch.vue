<script setup lang="ts">
import type { BaseFormData, BaseSearchList } from '#/form';
import type { FormInstance } from 'ant-design-vue';
import { Button, Col, Form } from 'ant-design-vue';
import { DownOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { computed, reactive, ref, useTemplateRef, watch } from 'vue';
import { getComponent } from '@/components/Form/utils/componentMap';
import { filterEmptyStr, filterFormItem, handleValuePropName } from '@/components/Form/utils/helper';
import { filterDayjs, toControlValue } from '@/components/Dates/utils/helper';
import { useMenuStore } from '@/stores/menu';

defineOptions({ name: 'BaseSearch' });

const props = withDefaults(
  defineProps<{
    list: BaseSearchList[];
    data?: BaseFormData;
    isLoading?: boolean;
    isSearch?: boolean;
    isReset?: boolean;
    isRowExpand?: boolean;
    type?: 'default' | 'grid';
    defaultColCount?: number;
    defaultRowExpand?: number;
    labelCol?: Record<string, unknown>;
    wrapperCol?: Record<string, unknown>;
  }>(),
  {
    data: () => ({}),
    isLoading: false,
    isSearch: true,
    isReset: true,
    isRowExpand: true,
    type: 'default',
    defaultColCount: 4,
    defaultRowExpand: 2,
  },
);

const emit = defineEmits<{
  (e: 'handleFinish', values: Record<string, unknown>): void;
}>();

const { t } = useI18n();
const menuStore = useMenuStore();
const formRef = useTemplateRef<FormInstance>('formRef');

// 搜索数据模型
const formModel = reactive<Record<string, unknown>>({});
const isExpand = ref(false);

// 是否展示展开按钮
const isShowExpand = computed(() => {
  if (!props.isRowExpand) return false;
  const showNum = props.defaultColCount * props.defaultRowExpand;
  return showNum < props.list.length;
});

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

/**
 * 字段名路径
 */
const nameOf = (item: BaseSearchList): string[] => {
  return Array.isArray(item.name) ? item.name : [item.name];
};

/**
 * 标签列属性（labelWidth 优先，其次 labelCol，栅格模式默认 span 6）
 * 注：antd-vue 的 Col 会覆盖传入的 style，宽度改用 flex 表达
 */
const getLabelCol = (item: BaseSearchList): Record<string, unknown> | undefined => {
  if (item.labelWidth) return { flex: `0 0 ${item.labelWidth}px` };
  if (item.labelCol) return item.labelCol as Record<string, unknown>;
  if (props.labelCol) return props.labelCol;
  return props.type === 'grid' && !menuStore.isPhone ? { span: 6 } : undefined;
};

/**
 * 输入区列属性（wrapperWidth 优先，其次 wrapperCol，栅格模式默认 span 18）
 */
const getWrapperCol = (item: BaseSearchList): Record<string, unknown> | undefined => {
  if (item.wrapperWidth) return { flex: `0 0 ${item.wrapperWidth}px` };
  if (item.wrapperCol) return item.wrapperCol as Record<string, unknown>;
  if (props.wrapperCol) return props.wrapperCol;
  return props.type === 'grid' && !menuStore.isPhone ? { span: 18 } : undefined;
};

/**
 * 控件值变化处理
 */
const handleChange = (item: BaseSearchList) => {
  return (value: unknown, ...rest: unknown[]) => {
    setIn(formModel, nameOf(item), value);
    (item.componentProps as { onChange?: (...args: unknown[]) => void } | undefined)?.onChange?.(
      value,
      ...rest,
    );
  };
};

/**
 * 控件绑定属性
 */
const controlBindings = (item: BaseSearchList) => {
  const valueProp = handleValuePropName(item.component);
  return {
    [valueProp]: toControlValue(item.component, getIn(formModel, nameOf(item))),
    [`onUpdate:${valueProp}`]: handleChange(item),
    onChange: handleChange(item),
  };
};

// 初始化搜索数据
watch(
  () => props.data,
  (value) => {
    if (value && Object.keys(value).length) {
      Object.assign(formModel, value);
    }
  },
  { immediate: true, flush: 'post' },
);

/** 点击重置 */
const onReset = () => {
  formRef.value?.resetFields();
  Object.keys(formModel).forEach((key) => delete formModel[key]);
  submit();
};

/** 触发表单提交 */
const submit = () => {
  const el = formRef.value?.$el as HTMLFormElement | undefined;
  if (el?.requestSubmit) {
    el.requestSubmit();
  }
};

/**
 * 处理列表（展开/收缩）
 */
const filterList = computed(() => {
  if (!isShowExpand.value) return props.list;

  const showNum = props.defaultColCount * props.defaultRowExpand;

  return props.list.map((item, index) => {
    if (index < showNum) {
      return { ...item, hidden: false };
    }
    return { ...item, hidden: !isExpand.value };
  });
});

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

defineExpose({
  submit,
  resetFields: () => {
    formRef.value?.resetFields();
    Object.keys(formModel).forEach((key) => delete formModel[key]);
  },
  setFieldsValue: (values: Record<string, unknown>) => {
    Object.assign(formModel, values);
  },
  getFieldsValue: () => ({ ...formModel }),
});
</script>

<template>
  <div id="searches">
    <Form
      ref="formRef"
      :model="formModel"
      :layout="menuStore.isPhone ? 'horizontal' : 'inline'"
      @finish="onFinish"
      autocomplete="off"
    >
      <!-- 默认行内模式 -->
      <template v-if="type === 'default'">
        <Form.Item
          v-for="item in list"
          :key="String(item.name)"
          v-bind="filterFormItem(item)"
          class="!mb-5px"
          :label-col="getLabelCol(item) as never"
          :wrapper-col="getWrapperCol(item) as never"
        >
          <component :is="getComponent(t, item)" v-bind="controlBindings(item)" />
        </Form.Item>

        <div class="flex flex-wrap gap-10px">
          <Button
            v-if="isSearch"
            type="primary"
            html-type="submit"
            class="!mb-5px"
            :loading="isLoading"
          >
            <template #icon><SearchOutlined /></template>
            {{ t('public.search') }}
          </Button>

          <Button v-if="isReset" class="!mb-5px" @click="onReset">
            <template #icon><ReloadOutlined /></template>
            {{ t('public.reset') }}
          </Button>

          <div class="!mb-5px">
            <slot />
          </div>
        </div>
      </template>

      <!-- 栅格模式（可展开收缩） -->
      <template v-else>
        <div class="flex w-full flex-wrap">
          <div
            v-for="item in filterList"
            :key="String(item.name)"
            :style="{ width: item.hidden ? 0 : `${100 / (menuStore.isPhone ? 1 : defaultColCount)}%` }"
          >
            <Form.Item
              v-bind="filterFormItem(item)"
              class="!mb-5px"
              :label-col="getLabelCol(item) as never"
              :wrapper-col="getWrapperCol(item) as never"
            >
              <component :is="getComponent(t, item)" v-bind="controlBindings(item)" />
            </Form.Item>
          </div>

          <Col flex="auto">
            <div class="flex flex-wrap items-center justify-end gap-10px">
              <Button
                v-if="isSearch"
                type="primary"
                html-type="submit"
                class="!mb-5px"
                :loading="isLoading"
              >
                <template #icon><SearchOutlined /></template>
                {{ t('public.search') }}
              </Button>

              <Button v-if="isReset" class="!mb-5px" @click="onReset">
                <template #icon><ReloadOutlined /></template>
                {{ t('public.reset') }}
              </Button>

              <div class="!mb-5px">
                <slot />
              </div>

              <div
                v-if="isShowExpand"
                class="cursor-pointer text-12px color-#1677ff hover:color-#69b1ff"
                @click="isExpand = !isExpand"
              >
                <DownOutlined :rotate="isExpand ? 180 : 0" />
                {{ isExpand ? '收缩' : '展开' }}
              </div>
            </div>
          </Col>
        </div>
      </template>
    </Form>
  </div>
</template>
