<script setup lang="ts">
import type { SelectProps } from 'ant-design-vue';
import { Select } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { MAX_TAG_COUNT } from './index';

defineOptions({ name: 'BaseSelect' });

const props = defineProps<SelectProps>();

const { t } = useI18n();

// 处理非对象数组
const currentOptions = computed<SelectProps['options']>(() => {
  return props.options?.map((item) => {
    if (typeof item !== 'object') {
      return { label: item as string, value: item };
    }
    return item;
  });
});
</script>

<template>
  <Select
    allow-clear
    show-search
    :max-tag-count="MAX_TAG_COUNT"
    :placeholder="t('public.inputPleaseSelect')"
    :option-filter-prop="props.fieldNames?.label || 'label'"
    v-bind="$attrs"
    :options="currentOptions"
  />
</template>
