<script setup lang="ts">
import { Tooltip } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import SearchModal from './components/SearchModal.vue';

defineOptions({ name: 'GlobalSearch' });

const { t } = useI18n();
const isOpen = ref(false);

/** 切换显示 */
const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <Tooltip :title="t('public.search')">
    <Icon
      class="mr-3 flex cursor-pointer items-center justify-center text-lg"
      icon="uil-search"
      @click="toggle"
    />
  </Tooltip>

  <SearchModal v-model:open="isOpen" />
</template>
