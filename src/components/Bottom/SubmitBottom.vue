<script setup lang="ts">
import { Button } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

defineOptions({ name: 'SubmitBottom' });

const props = withDefaults(
  defineProps<{
    isLoading?: boolean;
    backPath?: string;
  }>(),
  {
    isLoading: false,
  },
);

const emit = defineEmits<{
  (e: 'handleConfirm'): void;
}>();

const { t } = useI18n();
const router = useRouter();

/** 返回 */
const onBack = () => {
  if (props.backPath) {
    router.push(props.backPath);
  } else {
    router.back();
  }
};
</script>

<template>
  <div
    class="bg fixed bottom-0 left-0 right-0 z-999 box-border flex w-full justify-end px-30px py-5px shadow shadow-gray-500"
  >
    <slot />

    <Button danger class="mr-10px" @click="onBack">
      {{ t('public.back') }}
    </Button>
    <Button type="primary" :loading="isLoading" @click="emit('handleConfirm')">
      {{ t('public.submit') }}
    </Button>
  </div>
</template>
