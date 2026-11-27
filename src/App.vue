<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch } from 'vue';
import dayjs from 'dayjs';
import { startVersionCheck } from '@/layouts/utils/helper';
import { useI18n } from 'vue-i18n';
import { ConfigProvider, theme } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { usePublicStore } from '@/stores/public';

const { locale, t } = useI18n();
watch(locale, (value) => dayjs.locale(value === 'en' ? 'en' : 'zh-cn'), {
  immediate: true,
});
let stopVersionCheck: (() => void) | undefined;
onMounted(() => {
  stopVersionCheck = startVersionCheck(t);
});
onBeforeUnmount(() => stopVersionCheck?.());
const publicStore = usePublicStore();

// antd 语言
const antdLocale = computed(() => (locale.value === 'en' ? enUS : zhCN));

// antd 主题算法
const themeAlgorithm = computed(() =>
  publicStore.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
);
</script>

<template>
  <ConfigProvider :locale="antdLocale" :theme="{ algorithm: themeAlgorithm }">
    <RouterView />
  </ConfigProvider>
</template>
