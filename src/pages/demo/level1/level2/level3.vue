<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseContent from '@/components/Content/BaseContent.vue';

defineOptions({ name: 'DemoLevel3' });

const { t } = useI18n();
</script>

<template>
  <BaseContent>
    <div class="m-30px">{{ t('content.threeTierStructure') }}</div>
  </BaseContent>
</template>
