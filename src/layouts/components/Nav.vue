<script setup lang="ts">
import type { NavData } from '@/menus/utils/helper';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMenuStore } from '@/stores/menu';

defineOptions({ name: 'LayoutNav' });

const props = withDefaults(
  defineProps<{
    list?: NavData[];
    class?: string;
  }>(),
  {
    list: () => [],
  },
);

const { locale } = useI18n();
const menuStore = useMenuStore();

// 面包屑数据（语言处理）
const nav = computed(() => {
  const currentLanguage = locale.value;
  return props.list.map((item) => {
    return currentLanguage === 'en' ? item.labelEn : item.labelZh || item.label;
  });
});
</script>

<template>
  <div v-if="!menuStore.isPhone" :class="`${props.class} flex items-center ellipsis break-all`">
    <template v-for="(item, index) in nav" :key="index">
      <span v-if="index !== 0" class="px-4px color-#000073 breadcrumb-separator">/</span>
      <span :class="`px-4px ${index !== nav.length - 1 ? 'breadcrumb-separator' : ''}`">
        {{ item }}
      </span>
    </template>
  </div>
</template>
