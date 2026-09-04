<script setup lang="ts">
import type { ModalProps } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { Modal, Spin, Tooltip } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { useMenuStore } from '@/stores/menu';
import './index.less';

defineOptions({ name: 'BaseModal' });

const props = withDefaults(
  defineProps<{
    open?: boolean;
    title?: string;
    width?: number | string;
    isLoading?: boolean;
    wrapClassName?: string;
  } & Omit<ModalProps, 'open' | 'title' | 'onCancel'>>(),
  {
    isLoading: false,
  },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'ok'): void;
}>();

const { t } = useI18n();
const menuStore = useMenuStore();

// 是否最大化
const isFullscreen = ref(false);
// 拖拽偏移
const transform = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// 是否允许拖拽（鼠标按住标题时）
const canDrag = computed(() => !menuStore.isPhone && !isFullscreen.value);

/**
 * 标题栏按下开始拖拽
 */
const onMouseDown = (e: MouseEvent) => {
  if (!canDrag.value) return;
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX - transform.value.x,
    y: e.clientY - transform.value.y,
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return;
    transform.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y,
    };
  };

  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

/** 最大化 */
const onFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  // 重置拖拽位置
  transform.value = { x: 0, y: 0 };
};

/** 点击关闭 */
const handleCancel = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  emit('cancel');
};

/** 弹窗关闭后重置状态 */
const afterClose = () => {
  isFullscreen.value = false;
  transform.value = { x: 0, y: 0 };
};
</script>

<template>
  <Modal
    v-bind="$attrs"
    :open="props.open"
    :title="undefined"
    :closable="false"
    :mask-closable="false"
    destroy-on-close
    :width="isFullscreen ? '100%' : props.width || 520"
    :wrap-class-name="isFullscreen ? 'full-modal' : props.wrapClassName || ''"
    :class="'base-modal'"
    :ok-text="t('public.ok')"
    :cancel-text="t('public.cancel')"
    :style="{ transform: `translate(${transform.x}px, ${transform.y}px)` }"
    @cancel="handleCancel"
    @ok="emit('ok')"
    @after-close="afterClose"
  >
    <!-- 自定义标题（可拖拽 + 最大化/关闭按钮） -->
    <template #title>
      <div class="modal-custom-title" @mousedown="onMouseDown">
        <span class="cursor-text select-none">{{ props.title || '' }}</span>
        <div class="absolute right-15px flex items-center">
          <Tooltip placement="bottom" :title="!isFullscreen ? t('public.maximize') : t('public.exitMaximized')">
            <div class="mt-3px cursor-pointer p-10px" @click="onFullscreen">
              <Icon
                class="text-lg"
                :icon="!isFullscreen ? 'ant-design:fullscreen-outlined' : 'ant-design:fullscreen-exit-outlined'"
              />
            </div>
          </Tooltip>
          <Tooltip placement="bottom" :title="t('public.close')">
            <div class="mt-3px cursor-pointer p-10px" @click="handleCancel">
              <Icon class="text-lg" icon="ant-design:close-outlined" />
            </div>
          </Tooltip>
        </div>
      </div>
    </template>

    <Spin :spinning="props.isLoading">
      <div class="base-modal-content">
        <slot />
      </div>
    </Spin>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Modal>
</template>
