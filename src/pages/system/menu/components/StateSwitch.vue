<script setup lang="ts">
import { message, Popconfirm, Switch } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { changeMenuState } from '@/servers/system/menu';

defineOptions({ name: 'StateSwitch' });

// 当前行数据
interface RowData {
  id: string;
  label: string;
  labelEn: string;
}

const props = defineProps<{
  value: number;
  record: RowData;
}>();

const { t, locale } = useI18n();
const isLoading = ref(false);
const localValue = ref(props.value);

const onChange = async () => {
  const value = localValue.value ? 0 : 1;
  const params = { id: props.record.id, state: value };

  try {
    isLoading.value = true;
    const { code, message: messageInfo } = await changeMenuState(params);
    if (Number(code) === 200) {
      message.success({
        content: messageInfo || t('public.successfulOperation'),
        key: 'success',
      });
      localValue.value = value;
    }
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Popconfirm
    :title="t('systems.menu.changeState')"
    :description="
      t('systems.menu.changeStateMsg', {
        name: locale === 'zh' ? record.label : record.labelEn,
        state: localValue ? t('public.hide') : t('public.show'),
      })
    "
    @confirm="onChange"
  >
    <Switch
      :checked="!!localValue"
      :loading="isLoading"
      :checked-children="t('public.show')"
      :un-checked-children="t('public.hide')"
    />
  </Popconfirm>
</template>
