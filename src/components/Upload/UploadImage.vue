<script setup lang="ts">
import type { UploadProps } from 'ant-design-vue';
import { Upload } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { FILE_API } from '@/utils/config';

defineOptions({ name: 'UploadImage' });

const props = withDefaults(
  defineProps<{
    maxCount?: number;
  } & Omit<UploadProps, 'fileList'>>(),
  {
    maxCount: 1,
  },
);

// 文件列表（表单 autoLink valuePropName=fileList）
const fileList = defineModel<UploadProps['fileList']>('fileList');

// 上传地址
const uploadUrl = FILE_API;

// 预览图
const previewUrl = computed(() => {
  const file = fileList.value?.[0];
  if (file?.url) return file.url;
  if (file?.originFileObj) return URL.createObjectURL(file.originFileObj);
  return '';
});
</script>

<template>
  <Upload
    v-model:file-list="fileList"
    :action="uploadUrl"
    list-type="picture-card"
    :max-count="props.maxCount"
    accept="image/*"
    v-bind="$attrs"
  >
    <div v-if="!previewUrl">
      <Icon class="text-lg" icon="ant-design:plus-outlined" />
      <div class="mt-2px text-12px">上传</div>
    </div>
  </Upload>
</template>
