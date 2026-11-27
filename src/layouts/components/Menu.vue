<script setup lang="ts">
import type { SideMenu } from '#/public';
import type { MenuProps } from 'ant-design-vue';
import { Menu as AntMenu } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { computed, h, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isUrl } from '@/utils/is';
import {
  filterMenus,
  getFirstMenu,
  getMenuByKey,
  getOpenMenuByRouter,
  handleFilterMenus,
  splitPath,
} from '@/menus/utils/helper';
import Logo from '@/assets/images/logo.svg';
import { getTabTitle } from '../utils/helper';
import { setTitle } from '@/utils/helper';
import { useCommonStore } from '@/hooks/useCommonStore';
import styles from '../index.module.less';

defineOptions({ name: 'LayoutMenu' });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const {
  isMaximize,
  isCollapsed,
  isPhone,
  openKeys,
  selectedKeys,
  permissions,
  menuList,
  menuStore,
  tabsStore,
} = useCommonStore();

/**
 * 转换菜单icon格式
 */
const filterMenuIcon = (menus: SideMenu[]): SideMenu[] => {
  if (!menus?.length) return [];

  return menus.map((item) => {
    const newItem: SideMenu = { ...item };

    if (item?.icon && typeof item.icon === 'string') {
      newItem.icon = h(Icon, { icon: item.icon });
    }

    if (item?.children?.length) {
      newItem.children = filterMenuIcon(item.children);
    }

    return newItem;
  });
};

// 过滤菜单（权限 + 语言 + 图标）
const filteredMenus = computed(() => {
  if (!permissions.value.length || !menuList.value.length) return [];
  const newMenus = filterMenus(menuList.value, permissions.value);
  return filterMenuIcon(newMenus);
});

// 菜单项（去除多余字段）
const menuItems = computed<MenuProps['items']>(() => {
  return handleFilterMenus(filteredMenus.value) as MenuProps['items'];
});

// 刷新页面根据路由选中对应的菜单
watch(
  () => route.path,
  (path) => {
    const newOpenKey = getOpenMenuByRouter(path);
    menuStore.setOpenKeys(newOpenKey);
    menuStore.setSelectedKeys(path);
  },
  { immediate: true },
);

/**
 * 对比当前展开目录是否是同一层级
 */
const diffOpenMenu = (arr: string[], lastArr: string[]) => {
  return arr.every((item, index) => item === lastArr[index]);
};

/**
 * 展开/关闭回调
 * @param keys - 展开的菜单项
 */
const onOpenChange = (keys: (string | number)[]) => {
  const list = keys.map(String);
  const newOpenKey: string[] = [];

  if (list.length > 0) {
    const last = list[list.length - 1];
    const lastArr: string[] = splitPath(last);
    newOpenKey.push(last);

    // 对比当前展开目录是否是同一层级
    for (let i = list.length - 2; i >= 0; i--) {
      const arr = splitPath(list[i]);
      const hasOpenKey = diffOpenMenu(arr, lastArr);
      if (hasOpenKey) {
        newOpenKey.unshift(list[i]);
      }
    }
  }

  menuStore.setOpenKeys(newOpenKey);
};

/**
 * 隐藏菜单（手机端）
 */
const hiddenMenu = () => {
  menuStore.toggleCollapsed(true);
};

/**
 * 点击菜单
 * @param info - 菜单信息
 */
const onClickMenu: MenuProps['onClick'] = (info) => {
  const key = String(info.key);

  // 如果点击的菜单是当前菜单则退出
  if (key === route.path) return;

  // 手机端点击后隐藏菜单
  if (isPhone.value) {
    hiddenMenu();
  }

  // 如果是外链则跳转
  if (isUrl(key)) {
    window.open(key, '_blank');
    return;
  }

  // 立即更新菜单状态
  menuStore.setSelectedKeys(key);

  // 标签栏操作
  tabsStore.setActiveKey(key);
  const newItems = getMenuByKey({
    menus: menuList.value,
    permissions: permissions.value,
    key,
  });

  if (newItems?.key) {
    tabsStore.setActiveKey(newItems.key);
    tabsStore.setNav(newItems.nav);
    tabsStore.addTabs({
      ...newItems,
      nav: newItems.nav.map((item) => ({ ...item })),
    });
  } else {
    tabsStore.setActiveKey(key);
  }

  // 刷新标题
  const title = getTabTitle(tabsStore.tabs, key);
  if (title) setTitle(t, title);

  router.push(key);
};

/** 点击logo */
const onClickLogo = () => {
  const firstMenu = getFirstMenu(filteredMenus.value, permissions.value);
  if (firstMenu) router.push(firstMenu);
  if (isPhone.value) {
    hiddenMenu();
  }
};
</script>

<template>
  <!-- 侧边菜单 -->
  <div
    :class="`
      transition-all
      overflow-auto
      z-2
      ${styles.menu}
      ${isCollapsed ? styles['menu-close'] : ''}
      ${isMaximize || (isPhone && isCollapsed) ? styles['menu-none'] : ''}
      ${isPhone ? '!z-1002' : ''}
    `"
  >
    <!-- logo -->
    <div
      :class="`
        text-white
        flex
        content-center
        px-5
        py-2
        cursor-pointer
        ${isCollapsed ? 'justify-center' : ''}
      `"
      @click="onClickLogo"
    >
      <img
        :src="Logo"
        width="30"
        height="30"
        class="object-contain"
        alt="logo"
      />
      <span
        :class="`text-white ml-3 text-xl font-bold truncate ${isCollapsed ? 'hidden' : ''}`"
      >
        {{ t('public.currentName') }}
      </span>
    </div>

    <AntMenu
      id="layout-menu"
      class="z-1000"
      :selected-keys="[selectedKeys]"
      :open-keys="isCollapsed && !isPhone ? undefined : openKeys"
      mode="inline"
      theme="dark"
      :force-sub-menu-render="true"
      :inline-collapsed="isPhone ? false : isCollapsed"
      :items="menuItems"
      @click="onClickMenu"
      @open-change="onOpenChange"
    />
  </div>

  <!-- 手机端遮罩 -->
  <div
    v-if="isPhone && !isCollapsed"
    class="fixed z-1001 h-full w-full bg-gray-500 bg-opacity-10"
    @click="hiddenMenu"
  />
</template>
