<script setup lang="ts">
import type { ApiSelectProps } from './types';
import type { DefaultOptionType } from 'ant-design-vue/es/select';
import { Select, Spin } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import { MAX_TAG_COUNT } from './index';

defineOptions({ name: 'ApiSelect' });

const props = defineProps<ApiSelectProps>();

const { t } = useI18n();
const isLoading = ref(false);
const options = ref<DefaultOptionType[]>([]);

/** 获取接口数据 */
const getApiData = async () => {
  if (!props.api) return;
  try {
    const { api, params, apiResultKey } = props;

    isLoading.value = true;
    const apiFun = Array.isArray(params) ? api(...params) : api(params);
    const { code, data } = await apiFun;
    if (Number(code) !== 200) return;
    const result = apiResultKey
      ? (data as Record<string, unknown>)?.[apiResultKey]
      : data;
    options.value = result as DefaultOptionType[];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // 当有值时自动获取接口
  if (props.value !== undefined && props.value !== null && options.value.length === 0) {
    getApiData();
  }
});

/**
 * 展开下拉回调
 * @param open - 是否展开
 */
const onOpenChange = (open: boolean) => {
  if (open) getApiData();
};
</script>

<template>
  <Select
    allow-clear
    show-search
    :max-tag-count="MAX_TAG_COUNT"
    :placeholder="t('public.inputPleaseSelect')"
    :option-filter-prop="props.fieldNames?.label || 'label'"
    v-bind="$attrs"
    :loading="isLoading"
    :options="options"
    @open-change="onOpenChange"
  >
    <template #notFoundContent>
      <div v-if="isLoading" class="py-3px text-center">
        <Spin size="small" />
      </div>
    </template>
  </Select>
</template>
