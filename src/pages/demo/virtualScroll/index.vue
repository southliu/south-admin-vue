<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseContent from '@/components/Content/BaseContent.vue';
import VirtualList from './components/VirtualList.vue';
import VirtualTable from './components/VirtualTable.vue';
import { useCommonStore } from '@/hooks/useCommonStore';

defineOptions({ name: 'DemoVirtualScroll' });

const { t } = useI18n();
const { menuStore } = useCommonStore();
</script>

<template>
  <BaseContent>
    <div class="bg h-full flex overflow-auto py-5px px-30px" :class="menuStore.isPhone ? 'flex-wrap' : ''">
      <div class="mr-30px mb-20px flex flex-col">
        <h2>{{ t('content.virtualScroll1') }}：</h2>
        <div class="h-500px w-300px border border-solid border-#ececec">
          <VirtualList />
        </div>
      </div>

      <div class="overflow-auto">
        <h2>{{ t('content.virtualScroll2') }}：</h2>
        <VirtualTable />
      </div>
    </div>
  </BaseContent>
</template>
