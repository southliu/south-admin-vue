<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'SearchFooter' });

const { t } = useI18n();
</script>

<template>
  <div class="flex items-center text-dark-50">
    <span class="mr-14px flex items-center">
      <Icon class="mr-5px p-2px text-20px" icon="ant-design:enter-outlined" />
      <span>{{ t('public.confirm') }}</span>
    </span>
    <span class="mr-14px flex items-center">
      <Icon class="mr-5px p-2px text-20px" icon="mdi-arrow-up-thin" />
      <Icon class="mr-5px p-2px text-20px" icon="mdi-arrow-down-thin" />
      <span>{{ t('public.switch') }}</span>
    </span>
    <span class="flex items-center">
      <Icon class="mr-5px p-2px text-20px" icon="mdi:keyboard-esc" />
      <span>{{ t('public.close') }}</span>
    </span>
  </div>
</template>
