import type { Ref, ShallowRef } from 'vue';
import * as echarts from 'echarts/core';
import {
  BarChart,
  GaugeChart,
  LineChart,
  PictorialBarChart,
  PieChart,
  RadarChart,
  ScatterChart,
} from 'echarts/charts';
import type {
  BarSeriesOption,
  GaugeSeriesOption,
  LineSeriesOption,
  PictorialBarSeriesOption,
  PieSeriesOption,
  RadarSeriesOption,
  ScatterSeriesOption,
} from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
} from 'echarts/components';
import type {
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useDebounceFn, useResizeObserver } from '@vueuse/core';
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';

export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | ScatterSeriesOption
  | PictorialBarSeriesOption
  | RadarSeriesOption
  | GaugeSeriesOption
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | ToolboxComponentOption
  | DatasetComponentOption
>;

echarts.use([
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  PictorialBarChart,
  RadarChart,
  GaugeChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

/**
 * 使用Echarts
 * @param elRef - 容器元素ref
 * @param options - 绘制echarts的参数（响应式）
 */
export function useEcharts(elRef: Ref<HTMLElement | null>, options: Ref<ECOption | undefined>) {
  const charts: ShallowRef<echarts.EChartsType | null> = shallowRef(null);

  // 防抖resize
  const debouncedResize = useDebounceFn(() => {
    charts.value?.resize({
      animation: {
        duration: 500,
      },
    });
  }, 50);

  onMounted(() => {
    if (!elRef.value || !options.value) return;
    charts.value = echarts.init(elRef.value);
    charts.value.setOption(options.value);

    // 监听容器尺寸变化
    useResizeObserver(elRef.value, debouncedResize);
  });

  // 当数据变化时更新图表
  watch(
    options,
    (value) => {
      if (value && charts.value) {
        charts.value.setOption(value);
      }
    },
    { deep: true },
  );

  // 销毁echarts
  onBeforeUnmount(() => {
    charts.value?.dispose();
    charts.value = null;
  });

  return { charts };
}
