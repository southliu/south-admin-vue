<script setup lang="ts">
import type { Dayjs } from 'dayjs';
import { TimePicker } from 'ant-design-vue';
import { computed } from 'vue';
import { string2Dayjs } from '../utils/helper';

defineOptions({ name: 'BaseTimePicker', inheritAttrs: false });

const props = defineProps<{
  value?: Dayjs | string | number | null;
}>();

// 如果值不是dayjs类型则进行转换
const innerValue = computed(() =>
  props.value === undefined || props.value === null
    ? undefined
    : string2Dayjs(props.value),
);
</script>

<template>
  <TimePicker v-bind="{ ...$attrs, value: innerValue }" />
</template>
