import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { usePublicStore } from '@/stores/public';
import { useTabsStore } from '@/stores/tabs';
import { useUserStore } from '@/stores/user';

/**
 * 聚合常用store数据（与 React 版 useCommonStore 一致）
 */
export function useCommonStore() {
  const userStore = useUserStore();
  const menuStore = useMenuStore();
  const publicStore = usePublicStore();
  const tabsStore = useTabsStore();

  const { permissions, userInfo } = storeToRefs(userStore);
  const { isPhone, isCollapsed, openKeys, selectedKeys, menuList } =
    storeToRefs(menuStore);
  const { theme, isFullscreen, isRefresh } = storeToRefs(publicStore);
  const { isMaximize, nav, tabs, activeKey } = storeToRefs(tabsStore);

  return {
    // user
    permissions,
    userInfo,
    userId: computed(() => userInfo.value.id),
    username: computed(() => userInfo.value.username),
    name: computed(() => userInfo.value.name),
    roles: computed(() => userInfo.value.roles),
    // menu
    isPhone,
    isCollapsed,
    openKeys,
    selectedKeys,
    menuList,
    // public
    theme,
    isFullscreen,
    isRefresh,
    // tabs
    isMaximize,
    nav,
    tabs,
    activeKey,
    // stores
    userStore,
    menuStore,
    publicStore,
    tabsStore,
  };
}
