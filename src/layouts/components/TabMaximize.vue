<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useTabsStore } from '@/stores/tabs';

defineOptions({ name: 'TabMaximize' });

const tabsStore = useTabsStore();

/** 点击最大化/最小化 */
const onClick = () => {
  tabsStore.toggleMaximize(!tabsStore.isMaximize);
};
</script>

<template>
  <div class="cursor-pointer text-lg">
    <Icon
      v-show="tabsStore.isMaximize"
      class="flex items-center justify-center"
      icon="ant-design:compress-outlined"
      @click="onClick"
    />
    <Icon
      v-show="!tabsStore.isMaximize"
      class="flex items-center justify-center"
      icon="ant-design:expand-outlined"
      @click="onClick"
    />
  </div>
</template>
