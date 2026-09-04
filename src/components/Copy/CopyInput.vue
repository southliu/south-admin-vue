<script setup lang="ts">
import { Input } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { useClipboard } from '@/hooks/useClipboard';
import { message } from '@/utils/message';

defineOptions({ name: 'CopyInput', inheritAttrs: false });

const { t } = useI18n();
const { isCopied, error, copyText } = useClipboard();

const value = ref('');

// 复制结果提示
watch([isCopied, error], () => {
  if (isCopied.value && !error.value) {
    message.success({ content: t('public.copySuccessfully'), key: 'copy' });
  }

  if (error.value) {
    message.warning({ content: error.value || t('public.copyFailed'), key: 'copy' });
  }
});

/**
 * 处理复制
 * @param val - 复制内容
 */
const handleCopy = (val: string) => {
  if (!val) {
    return message.warning({ content: t('public.inputPleaseEnter'), key: 'copy' });
  }
  try {
    copyText(val);
  } catch (e) {
    console.error(e);
    message.warning({ content: t('public.copyFailed'), key: 'copy' });
  }
};
</script>

<template>
  <Input.Search
    v-model:value="value"
    v-bind="$attrs"
    :placeholder="t('public.inputPleaseEnter')"
    :enter-button="t('public.copy')"
    @search="handleCopy"
  />
</template>
