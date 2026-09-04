<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';

defineOptions({ name: 'VirtualTable' });

const { t } = useI18n();

// 与 React 版参数一致：10000行、滚动区高500、列宽200
const TOTAL = 10000;
const ROW_HEIGHT = 44;
const BODY_HEIGHT = 500;
const OVERSCAN = 6;
const COL_WIDTH = 200;

const columns = [
  { title: 'ID', key: 'id' },
  { title: t('public.name'), key: 'name' },
  { title: t('system.phone'), key: 'phone' },
  { title: t('system.age'), key: 'number' },
] as const;

/** 行数据 */
const rowData = (index: number) => {
  const num = index + 1;
  return {
    id: num,
    name: 'name' + num,
    phone: num * 13,
    number: num * 3,
  };
};

const scrollTop = ref(0);

/** 处理滚动 */
const onScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLElement).scrollTop;
};

// 可视区间（含上下过度渲染），滚动时确定性更新，不依赖容器尺寸测量
const rows = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN);
  const end = Math.min(
    TOTAL,
    Math.ceil((scrollTop.value + BODY_HEIGHT) / ROW_HEIGHT) + OVERSCAN,
  );
  const list: number[] = [];
  for (let i = start; i < end; i++) list.push(i);
  return list;
});
</script>

<template>
  <div
    class="w-full overflow-x-auto"
    :style="{
      borderRadius: '10px',
      borderRight: '1px solid rgba(0, 0, 0, 0.05)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    }"
  >
    <!-- 表头 -->
    <div
      class="flex text-14px"
      :style="{
        background: '#fafafa',
        fontWeight: 600,
        color: 'rgba(0, 0, 0, 0.88)',
        borderBottom: '1px solid #f0f0f0',
      }"
    >
      <div
        v-for="col in columns"
        :key="col.key"
        class="box-border flex h-39px flex-shrink-0 items-center px-8px"
        :style="{ width: `${COL_WIDTH}px` }"
      >
        {{ col.title }}
      </div>
    </div>

    <!-- 表体（虚拟滚动） -->
    <div :style="{ height: `${BODY_HEIGHT}px`, overflowY: 'auto' }" @scroll.passive="onScroll">
      <div :style="{ height: `${TOTAL * ROW_HEIGHT}px`, position: 'relative' }">
        <div
          v-for="i in rows"
          :key="i"
          class="absolute right-0 left-0 flex text-14px"
          :style="{
            top: `${i * ROW_HEIGHT}px`,
            height: `${ROW_HEIGHT}px`,
            borderBottom: '0.8px solid #f0f0f0',
          }"
        >
          <div
            v-for="col in columns"
            :key="col.key"
            class="box-border flex flex-shrink-0 items-center truncate px-8px"
            :style="{ width: `${COL_WIDTH}px` }"
          >
            {{ rowData(i)[col.key] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
