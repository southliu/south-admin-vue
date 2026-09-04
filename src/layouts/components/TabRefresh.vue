<script setup lang="ts">
import { Tooltip } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'TabRefresh' });

defineProps<{
  isRefresh: boolean;
}>();

const emit = defineEmits<{
  (e: 'onClick'): void;
}>();

const { t } = useI18n();
</script>

<template>
  <Tooltip :title="t('public.reload')" placement="bottom">
    <Icon
      :class="`
        change
        flex
        items-center
        justify-center
        text-lg
        cursor-pointer
        ${isRefresh ? 'animate-spin pointer-events-none' : ''}
      `"
      icon="ant-design:reload-outlined"
      @click="emit('onClick')"
    />
  </Tooltip>
</template>
