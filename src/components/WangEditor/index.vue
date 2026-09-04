<script setup lang="ts">
import type { IDomEditor, IEditorConfig } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue';

defineOptions({ name: 'WangEditor' });

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    height?: number;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    height: 300,
    placeholder: '请输入内容...',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

// 编辑器实例
const editorRef = shallowRef<IDomEditor>();
// 兼容 v-model:modelValue 与表单 autoLink 注入的 value
const valueHtml = ref(props.modelValue || props.value || '');

// 工具栏配置
const toolbarConfig = {};

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  MENU_CONF: {},
};

// 同步外部值
watch(
  () => props.modelValue || props.value,
  (value) => {
    if (value !== valueHtml.value) {
      valueHtml.value = value || '';
    }
  },
);

/**
 * 值变化
 * @param editor - 编辑器实例
 */
const handleChange = (editor: IDomEditor) => {
  const html = editor.getHtml();
  emit('update:modelValue', html);
  emit('change', html);
};

/**
 * 编辑器创建完成
 * @param editor - 编辑器实例
 */
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor;
};

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<template>
  <div class="border border-solid border-gray-300 rounded z-100">
    <Toolbar
      ref="toolbarRef"
      class="border-b border-solid border-gray-300"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="'default'"
    />
    <Editor
      :style="{ height: `${props.height}px`, overflowY: 'hidden' }"
      v-model="valueHtml"
      :default-config="editorConfig"
      :mode="'default'"
      @on-created="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>
