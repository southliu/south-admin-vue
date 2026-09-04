<script setup lang="ts">
import { Button } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import BaseContent from '@/components/Content/BaseContent.vue';
import { useWatermark } from '@/hooks/useWatermark';

defineOptions({ name: 'DemoWatermark' });

const { t } = useI18n();
const { Watermark, RemoveWatermark } = useWatermark();

/** 添加水印 */
const openWatermark = () => {
  Watermark({
    content: t('content.watermark'),
    height: 300,
    width: 350,
    rotate: -20,
    color: '#000',
    fontSize: 30,
    opacity: 0.07,
  });
};
</script>

<template>
  <BaseContent>
    <div class="bg p-30px">
      <Button @click="openWatermark">{{ t('content.openWatermark') }}</Button>
      <Button danger @click="RemoveWatermark">
        {{ t('content.hideWatermark') }}
      </Button>
    </div>
  </BaseContent>
</template>
