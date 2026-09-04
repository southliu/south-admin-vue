<script setup lang="ts">
import { Tooltip } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useFullscreen } from '@/hooks/useFullscreen';

defineOptions({ name: 'Fullscreen' });

const { t } = useI18n();
const { isFullscreen, toggleFullscreen } = useFullscreen();
</script>

<template>
  <Tooltip :title="isFullscreen ? t('public.exitFullscreen') : t('public.fullScreen')">
    <div
      class="mr-3 flex cursor-pointer items-center justify-center text-lg"
      @click="toggleFullscreen"
    >
      <Icon v-show="isFullscreen" icon="gridicons-fullscreen-exit" />
      <Icon v-show="!isFullscreen" icon="gridicons-fullscreen" />
    </div>
  </Tooltip>
</template>
