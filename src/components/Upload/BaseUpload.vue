<script setup lang="ts">
import type { UploadProps } from 'ant-design-vue';
import { Button, Upload } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { FILE_API } from '@/utils/config';

defineOptions({ name: 'BaseUpload' });

const props = withDefaults(
  defineProps<{
    maxCount?: number;
    accept?: string;
    buttonText?: string;
  } & Omit<UploadProps, 'fileList'>>(),
  {
    maxCount: 1,
  },
);

const { t } = useI18n();

// 文件列表（表单 autoLink valuePropName=fileList）
const fileList = defineModel<UploadProps['fileList']>('fileList');

// 上传地址
const uploadUrl = FILE_API;

/**
 * 上传变化
 * @param info - 上传信息
 */
const handleChange: UploadProps['onChange'] = (info) => {
  props.onChange?.(info);
};
</script>

<template>
  <Upload
    v-model:file-list="fileList"
    :action="uploadUrl"
    :max-count="props.maxCount"
    :accept="props.accept"
    v-bind="$attrs"
    @change="handleChange"
  >
    <Button>
      <template #icon>
        <Icon icon="ant-design:upload-outlined" />
      </template>
      {{ buttonText || t('public.uploadFile') }}
    </Button>
  </Upload>
</template>
