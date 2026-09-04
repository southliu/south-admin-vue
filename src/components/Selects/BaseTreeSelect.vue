<script setup lang="ts">
import type { TreeSelectProps } from 'ant-design-vue';
import { TreeSelect } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { MAX_TAG_COUNT } from './index';

defineOptions({ name: 'BaseTreeSelect' });

defineProps<TreeSelectProps>();

const { t } = useI18n();
</script>

<template>
  <TreeSelect
    allow-clear
    show-search
    :max-tag-count="MAX_TAG_COUNT"
    :tree-node-filter-prop="($attrs.fieldNames as { label?: string } | undefined)?.label || 'label'"
    :placeholder="t('public.inputPleaseSelect')"
    v-bind="$attrs"
  />
</template>
