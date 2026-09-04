<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

defineOptions({ name: 'BaseContent' });

const Forbidden = defineAsyncComponent(() => import('@/pages/403.vue'));

withDefaults(
  defineProps<{
    isPermission?: boolean;
  }>(),
  {
    isPermission: true,
  },
);
</script>

<template>
  <div v-if="isPermission !== false" id="content" class="p-10px">
    <slot />
  </div>
  <div v-else class="box-border h-full overflow-auto p-10px">
    <Forbidden />
  </div>
</template>
