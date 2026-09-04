<script setup lang="ts">
import type { ECOption } from '@/hooks/useEcharts';
import { useI18n } from 'vue-i18n';
import { computed, useTemplateRef } from 'vue';
import { useEcharts } from '@/hooks/useEcharts';

defineOptions({ name: 'DashboardLine' });

const { t } = useI18n();
const echartsRef = useTemplateRef<HTMLDivElement>('echartsRef');

const option = computed<ECOption>(() => ({
  title: {
    text: t('dashboard.effectiveRechargeRatio'),
    left: 30,
    top: 5,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['07-11', '07-12', '07-13', '07-14', '07-15', '07-16', '07-17'],
  },
  yAxis: {
    type: 'value',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  series: [
    {
      name: t('dashboard.rechargeAmount'),
      type: 'line',
      areaStyle: {
        color: '#1890ff',
        opacity: 0.2,
      },
      emphasis: {
        focus: 'series',
      },
      data: [120, 140, 120, 190, 150, 111, 160],
    },
    {
      name: t('dashboard.usersNumber'),
      type: 'line',
      areaStyle: {
        color: '#1890ff',
        opacity: 0.3,
      },
      emphasis: {
        focus: 'series',
      },
      data: [90, 122, 90, 140, 123, 280, 200],
    },
  ],
}));

useEcharts(echartsRef, option);
</script>

<template>
  <div class="h-550px rounded-10px border border-gray-200">
    <div ref="echartsRef" class="echarts h-full w-full"></div>
  </div>
</template>
