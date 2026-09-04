<script setup lang="ts">
import type { ButtonProps } from 'ant-design-vue';
import { Button, Popconfirm } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'DeleteBtn' });

const props = withDefaults(
  defineProps<{
    isLoading?: boolean;
    btnType?: 'delete' | 'batchDelete';
    name?: string;
    customizeTitle?: string;
    isIcon?: boolean;
  } & ButtonProps>(),
  {
    isLoading: false,
    btnType: 'delete',
    isIcon: false,
  },
);

const emit = defineEmits<{
  (e: 'handleDelete'): void;
}>();

const { t } = useI18n();

// 确认描述
const description = () => {
  const key =
    props.btnType === 'delete' ? 'public.deleteConfirmMessage' : 'public.batchDeleteConfirmMessage';
  return t(key, { name: props.name ? ` ${props.name} ` : '' });
};
</script>

<template>
  <Popconfirm :title="t('public.kindTips')" :description="description()" @confirm="emit('handleDelete')">
    <Button
      danger
      type="primary"
      v-bind="$attrs"
      class="small-btn"
      :loading="!!(isLoading || $attrs.loading)"
    >
      <template #icon>
        <slot name="icon">
          <DeleteOutlined v-if="isIcon" />
        </slot>
      </template>
      <slot>
        {{ customizeTitle || (btnType === 'delete' ? t('public.delete') : t('public.batchDelete')) }}
      </slot>
    </Button>
  </Popconfirm>
</template>
