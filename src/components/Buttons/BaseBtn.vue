<script setup lang="ts">
import type { ButtonProps } from 'ant-design-vue';
import { Button } from 'ant-design-vue';

defineOptions({ name: 'BaseBtn' });

withDefaults(
  defineProps<{
    isLoading?: boolean;
  } & ButtonProps>(),
  {
    isLoading: false,
  },
);
</script>

<template>
  <Button
    type="primary"
    v-bind="$attrs"
    class="small-btn"
    :loading="!!(isLoading || $attrs.loading)"
  >
    <slot />
  </Button>
</template>
