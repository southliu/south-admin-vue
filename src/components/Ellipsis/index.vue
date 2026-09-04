<script setup lang="ts">
import { Tooltip } from 'ant-design-vue';
import { computed } from 'vue';

defineOptions({ name: 'Ellipsis' });

const props = withDefaults(
  defineProps<{
    text?: string;
    line?: number;
    tooltip?: boolean;
  }>(),
  {
    text: '',
    line: 1,
    tooltip: true,
  },
);

const style = computed(() => {
  if (props.line > 1) {
    return {
      display: '-webkit-box',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      '-webkit-line-clamp': String(props.line),
      '-webkit-box-orient': 'vertical' as const,
    };
  }
  return {
    display: 'inline-block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
});
</script>

<template>
  <Tooltip v-if="tooltip && text" :title="text">
    <span :style="style">{{ text }}</span>
  </Tooltip>
  <span v-else :style="style">{{ text }}</span>
</template>
