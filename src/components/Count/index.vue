<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

defineOptions({ name: 'Count' });

const props = withDefaults(
  defineProps<{
    value?: number;
    duration?: number;
    decimals?: number;
  }>(),
  {
    value: 0,
    duration: 1000,
    decimals: 0,
  },
);

const displayValue = ref(0);
let rafId: number | null = null;

/**
 * 缓动函数
 */
const easeOutQuad = (t: number) => t * (2 - t);

/**
 * 动画更新
 */
const animate = (from: number, to: number) => {
  if (rafId) cancelAnimationFrame(rafId);

  const start = performance.now();

  const update = (now: number) => {
    const progress = Math.min((now - start) / props.duration, 1);
    const eased = easeOutQuad(progress);
    displayValue.value = from + (to - from) * eased;

    if (progress < 1) {
      rafId = requestAnimationFrame(update);
    }
  };

  rafId = requestAnimationFrame(update);
};

watch(
  () => props.value,
  (newValue, oldValue) => {
    animate(oldValue || 0, newValue || 0);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
});

// 格式化显示
const showValue = computed(() => {
  return Number(displayValue.value.toFixed(props.decimals)).toLocaleString();
});
</script>

<template>
  <span>{{ showValue }}</span>
</template>
