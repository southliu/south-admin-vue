<script setup lang="ts">
import type { SideMenu } from '#/public';
import { Input, Modal } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { getMenuByKey, getOpenMenuByRouter, searchMenuValue } from '@/menus/utils/helper';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useMenuStore } from '@/stores/menu';
import { useTabsStore } from '@/stores/tabs';
import SearchResult from './SearchResult.vue';
import SearchFooter from './SearchFooter.vue';

defineOptions({ name: 'SearchModal' });

const open = defineModel<boolean>('open', { default: false });

const { t } = useI18n();
const router = useRouter();
const inputRef = useTemplateRef<HTMLInputElement>('inputRef');
const { permissions, menuList } = useCommonStore();
const menuStore = useMenuStore();
const tabsStore = useTabsStore();

const value = ref(''); // 输入框值
const active = ref(''); // 选中值
const list = ref<SideMenu[]>([]);

// 打开时聚焦输入框
watch(open, async (isOpen) => {
  if (isOpen) {
    value.value = '';
    active.value = '';
    list.value = [];
    await nextTick();
    inputRef.value?.focus();
  }
});

/** 关闭模态框 */
const onClose = () => {
  open.value = false;
};

/**
 * 更改选中值
 * @param key - 选中值
 */
const changActive = (key: string) => {
  active.value = key;
};

/** 点击回车 */
const onPressEnter = () => {
  if (active.value) {
    router.push(active.value);

    // 添加标签
    const newTab = getMenuByKey({ menus: menuList.value, permissions: permissions.value, key: active.value });
    if (newTab) tabsStore.addTabs({ ...newTab, nav: newTab.nav.map((item) => ({ ...item })) });
    tabsStore.setActiveKey(active.value);

    // 处理菜单展开
    const openKeys = getOpenMenuByRouter(active.value);
    menuStore.setOpenKeys(openKeys);

    onClose();
  }
};

/**
 * 防抖处理搜索结果
 * @param searchValue - 搜索值
 */
const debounceSearch = useDebounceFn((searchValue: string) => {
  const result = searchMenuValue({ menus: menuList.value, permissions: permissions.value, value: searchValue });
  if (result?.length) {
    active.value = result[0]?.key || '';
    list.value = result;
  } else {
    active.value = '';
    list.value = [];
  }
}, 200);

/**
 * 输入框值变化
 */
const onChange = (e: Event) => {
  const inputValue = (e.target as HTMLInputElement).value;
  value.value = inputValue;
  debounceSearch(inputValue);
};

/** 键盘事件 */
const onKeyDown = (e: KeyboardEvent) => {
  if (!list.value.length) return;

  const index = list.value.findIndex((item) => item.key === active.value);
  const len = list.value.length - 1;

  switch (e.key) {
    case 'ArrowUp':
      if (index > 0) active.value = list.value[index - 1].key;
      break;

    case 'ArrowDown':
      if (index < len) active.value = list.value[index + 1].key;
      break;

    case 'Enter':
      onPressEnter();
      break;

    default:
      break;
  }
};

// 列表存在值时监听按键事件
watch(
  () => list.value.length,
  (len) => {
    if (len) {
      window.addEventListener('keydown', onKeyDown);
    } else {
      window.removeEventListener('keydown', onKeyDown);
    }
  },
);
</script>

<template>
  <Modal class="rounded-100px" :open="open" :closable="false" :footer="null" @cancel="onClose">
    <Input
      ref="inputRef"
      :value="value"
      :placeholder="t('public.menuSearchPlaceholder')"
      allow-clear
      @change="onChange"
      @press-enter="onPressEnter"
    >
      <template #prefix>
        <Icon class="text-lg text-warm-gray-400" icon="ant-design:search-outlined" />
      </template>
    </Input>

    <SearchResult :list="list" :active="active" @cancel="onClose" @chang-active="changActive" />

    <template #footer>
      <SearchFooter />
    </template>
  </Modal>
</template>
