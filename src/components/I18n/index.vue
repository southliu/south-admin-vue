<script setup lang="ts">
import type { MenuProps } from 'ant-design-vue';
import { Dropdown } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useTabsStore } from '@/stores/tabs';
import { LANG } from '@/utils/config';
import { setTitle } from '@/utils/helper';
import { getTabTitle } from '@/layouts/utils/helper';
import { LANGUAGE_OPTIONS, type Langs } from './model';

defineOptions({ name: 'I18n' });

const { t, locale } = useI18n();
const route = useRoute();
const tabsStore = useTabsStore();

// 初始化语言（缓存优先）
const langCache = localStorage.getItem(LANG);
if (!langCache) {
  localStorage.setItem(LANG, 'zh');
} else if (locale.value !== langCache) {
  locale.value = langCache;
}

// 下拉菜单内容
const items: MenuProps['items'] = LANGUAGE_OPTIONS.map((item) => ({
  key: item.value,
  label: item.label,
}));

/** 设置浏览器标签 */
const handleSetTitle = () => {
  const path = `${route.path}${route.fullPath.replace(route.path, '') || ''}`;
  // 通过路由获取标签名
  const title = getTabTitle(tabsStore.tabs, path);
  if (title) setTitle(t, title);
};

/** 点击更换语言 */
const onClick: MenuProps['onClick'] = (e) => {
  locale.value = String(e.key) as Langs;
  localStorage.setItem(LANG, String(e.key));
  // 同步标签语言
  tabsStore.switchTabsLang(String(e.key));
  handleSetTitle();
};
</script>

<template>
  <Dropdown placement="bottom" trigger="click" :menu="{ items, onClick }">
    <div class="ant-dropdown-link flex cursor-pointer items-center" @click.prevent>
      <Icon
        class="mr-3 flex cursor-pointer items-center justify-center text-lg"
        icon="cil:language"
      />
    </div>
  </Dropdown>
</template>
