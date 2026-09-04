<script setup lang="ts">
import { Pagination } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import './index.less';

defineOptions({ name: 'BasePagination' });

const { t } = useI18n();

/**
 * 显示总数
 * @param total - 总数
 */
const showTotal = (total?: number): string => {
  return t('public.totalNum', { num: total || 0 });
};
</script>

<template>
  <div id="pagination" class="z-999 box-border min-h-40px flex w-full items-center justify-end">
    <Pagination
      v-bind="$attrs"
      show-size-changer
      show-quick-jumper
      size="small"
      :show-total="showTotal"
    />
  </div>
</template>
