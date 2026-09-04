<script setup lang="ts">
import type { Dayjs } from 'dayjs';
import { TimePicker } from 'ant-design-vue';
import { computed } from 'vue';
import { stringRang2DayjsRang } from '../utils/helper';

defineOptions({ name: 'BaseTimeRangePicker', inheritAttrs: false });

const { RangePicker } = TimePicker;

const props = defineProps<{
  value?: [string | number | Dayjs, string | number | Dayjs] | null;
}>();

// 如果值不是dayjs类型则进行转换
const innerValue = computed(() =>
  props.value === undefined || props.value === null
    ? undefined
    : (stringRang2DayjsRang(props.value) as [Dayjs, Dayjs] | undefined | null) ??
      undefined,
);
</script>

<template>
  <RangePicker v-bind="{ ...$attrs, value: innerValue }" />
</template>
