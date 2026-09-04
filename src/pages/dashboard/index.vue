<script setup lang="ts">
import type { BaseFormData } from '#/form';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import { getDataTrends } from '@/servers/dashboard';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseSearch from '@/components/Search/BaseSearch.vue';
import { checkPermission } from '@/utils/permissions';
import { useCommonStore } from '@/hooks/useCommonStore';
import { searchList } from './model';
import Block from './components/Block.vue';
import Line from './components/Line.vue';
import Bar from './components/Bar.vue';

defineOptions({ name: 'Dashboard' });

// 初始化搜索
const initSearch = {
  pay_date: ['2022-10-19', '2022-10-29'],
};

const { t } = useI18n();
const isLoading = ref(false);
const { permissions } = useCommonStore();
const isPermission = checkPermission('/dashboard', permissions.value);

/**
 * 搜索提交
 * @param values - 表单返回数据
 */
const handleSearch = async (values: BaseFormData) => {
  const query = { ...values };
  try {
    isLoading.value = true;
    await getDataTrends(query);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  handleSearch(initSearch);
});
</script>

<template>
  <BaseContent :is-permission="isPermission.page">
    <BaseCard>
      <BaseSearch
        :list="searchList(t)"
        :data="initSearch"
        :is-loading="isLoading"
        @handle-finish="handleSearch"
      />
    </BaseCard>

    <BaseCard class="mt-10px">
      <div class="pt-10px">
        <Block />
      </div>

      <div class="flex w-full flex-wrap justify-between">
        <div class="mb-10px w-49.5%">
          <Line />
        </div>
        <div class="mb-10px w-49.5%">
          <Bar />
        </div>
      </div>
    </BaseCard>
  </BaseContent>
</template>
