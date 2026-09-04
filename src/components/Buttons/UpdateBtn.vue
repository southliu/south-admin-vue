<script setup lang="ts">
import type { ButtonProps } from 'ant-design-vue';
import { Button } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'UpdateBtn' });

withDefaults(
  defineProps<{
    isLoading?: boolean;
  } & ButtonProps>(),
  {
    isLoading: false,
  },
);

const { t } = useI18n();
</script>

<template>
  <Button
    type="primary"
    v-bind="$attrs"
    class="small-btn"
    :loading="!!(isLoading || $attrs.loading)"
  >
    <slot>
      {{ t('public.edit') }}
    </slot>
  </Button>
</template>
