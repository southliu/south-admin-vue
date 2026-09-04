<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCommonStore } from '@/hooks/useCommonStore';

defineOptions({ name: 'VirtualList' });

const { theme } = useCommonStore();

// 容器高度与行高固定（与 React 版 react-window 参数一致）
const TOTAL = 10000;
const CONTAINER_HEIGHT = 500;
const ROW_HEIGHT = 35;
const OVERSCAN = 10;

const scrollTop = ref(0);

/** 处理滚动 */
const onScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLElement).scrollTop;
};

// 可视区间（含上下过度渲染），滚动时确定性更新，不依赖容器尺寸测量
const rows = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN);
  const end = Math.min(TOTAL, Math.ceil((scrollTop.value + CONTAINER_HEIGHT) / ROW_HEIGHT) + OVERSCAN);
  const list: number[] = [];
  for (let i = start; i < end; i++) list.push(i);
  return list;
});
</script>

<template>
  <div class="h-full w-full overflow-auto" @scroll.passive="onScroll">
    <div :style="{ height: `${TOTAL * ROW_HEIGHT}px`, position: 'relative' }">
      <div
        v-for="i in rows"
        :key="i"
        class="box-border flex items-center justify-between px-10px"
        :class="theme === 'dark' && i % 2 ? '!bg-#141414' : ''"
        :style="{
          position: 'absolute',
          top: `${i * ROW_HEIGHT}px`,
          height: `${ROW_HEIGHT}px`,
          left: 0,
          right: 0,
        }"
      >
        Name {{ i + 1 }}
        <div class="text-xs text-slate-500">{{ i + 1 }} of {{ TOTAL }}</div>
      </div>
    </div>
  </div>
</template>
