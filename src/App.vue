<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ConfigProvider, theme } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { usePublicStore } from '@/stores/public';

const { locale } = useI18n();
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
