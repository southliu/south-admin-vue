<script setup lang="ts">
import type { ApiTreeSelectProps } from './types';
import type { TreeSelectProps } from 'ant-design-vue';
import { TreeSelect, Spin } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue';
import { MAX_TAG_COUNT } from './index';

defineOptions({ name: 'ApiTreeSelect' });

const props = defineProps<ApiTreeSelectProps>();

const { t } = useI18n();
const controlProps = computed<Record<string, unknown>>(() => {
  const { api: _api, params: _params, apiResultKey: _key, ...rest } = props;
  return Object.assign(
    {
      allowClear: true,
      showSearch: true,
      maxTagCount: MAX_TAG_COUNT,
      placeholder: t('public.inputPleaseSelect'),
      treeNodeFilterProp: props.fieldNames?.label || 'label',
    },
    rest,
  ) as Record<string, unknown>;
});
const isLoading = ref(false);
let revision = 0;
let isDisposed = false;
const isOpen = ref(false);
onBeforeUnmount(() => {
  revision++;
  isDisposed = true;
});
const options = ref<TreeSelectProps['treeData']>([]);

/** 获取接口数据 */
const getApiData = async () => {
  if (isDisposed || !props.api || isLoading.value) return;
  const current = ++revision;
  try {
    const { api, params, apiResultKey } = props;

    isLoading.value = true;
    const apiFun = Array.isArray(params) ? api(...params) : api(params);
    const { code, data } = await apiFun;
    if (current !== revision || Number(code) !== 200) return;
    const result = apiResultKey
      ? (data as Record<string, unknown>)?.[apiResultKey]
      : data;
    options.value = Array.isArray(result) ? result : [];
  } catch {
    // 请求层统一提示异常，保留组件可重试状态。
  } finally {
    if (current === revision) isLoading.value = false;
  }
};

onMounted(() => {
  // 当有值时自动获取接口
  if (
    props.value !== undefined &&
    props.value !== null &&
    !options.value?.length
  ) {
    getApiData();
  }
});

watch(
  () => [props.api, props.params, props.apiResultKey],
  () => {
    revision++;
    isLoading.value = false;
    options.value = [];
    if (isOpen.value || props.value != null) void getApiData();
  },
  { deep: true },
);

/**
 * 展开下拉回调
 * @param open - 是否展开
 */
const onOpenChange = (open: boolean) => {
  isOpen.value = open;
  if (open) getApiData();
};
</script>

<template>
  <TreeSelect
    v-bind="{ ...controlProps, ...$attrs }"
    :loading="isLoading"
    :tree-data="options"
    @dropdown-visible-change="onOpenChange"
  >
    <template #notFoundContent>
      <div v-if="isLoading" class="py-3px text-center">
        <Spin size="small" />
      </div>
    </template>
  </TreeSelect>
</template>
