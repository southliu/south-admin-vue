<script setup lang="ts">
import { Button } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
import { useClipboard } from '@/hooks/useClipboard';
import { message } from '@/utils/message';

defineOptions({ name: 'CopyBtn' });

const props = defineProps<{
  text: string;
  value: string;
}>();

const { t } = useI18n();
const { isCopied, error, copyText } = useClipboard();

// 复制结果提示
watch([isCopied, error], () => {
  if (isCopied.value && !error.value) {
    message.success({ content: t('public.copySuccessfully'), key: 'copy' });
  }

  if (error.value) {
    message.warning({ content: error.value || t('public.copyFailed'), key: 'copy' });
  }
});

/** 点击处理 */
const onClick = () => {
  try {
    copyText(props.value);
  } catch (e) {
    console.error(e);
    message.warning({ content: t('public.copyFailed'), key: 'copy' });
  }
};
</script>

<template>
  <Button v-bind="$attrs" @click="onClick">
    <template #icon>
      <Icon icon="ant-design:copy-outlined" />
    </template>
    {{ text }}
  </Button>
</template>
