import type { NavData } from '@/menus/utils/helper';
import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 标签数据 */
export interface TabsData {
  key: string; // 路由路径
  label: string; // 当前语言标签
  labelZh: string; // 中文标签
  labelEn: string; // 英文标签
  nav: NavData[]; // 面包屑
  urlParams?: string; // url参数
  closable?: boolean; // 是否可关闭
  cacheName?: string; // keep-alive 缓存组件名
}

/** tabs持久化key */
const TABS_STORAGE = 'tabs_storage';

/** 读取本地持久化的tabs状态 */
function loadTabsState() {
  try {
    const json = localStorage.getItem(TABS_STORAGE);
    if (json)
      return JSON.parse(json) as Partial<{
        activeKey: string;
        nav: NavData[];
        tabs: TabsData[];
      }>;
  } catch (error) {
    console.error('tabs_storage 解析失败:', error);
  }
  return null;
}

/** 标签store */
export const useTabsStore = defineStore('tabs', () => {
  const storage = loadTabsState();

  // 是否锁定关闭标签（关闭时导航由调用方控制）
  const isCloseTabsLock = ref(false);
  // 是否最大化
  const isMaximize = ref(false);
  // 当前选中标签
  const activeKey = ref(storage?.activeKey || '');
  // 面包屑
  const nav = ref<NavData[]>(storage?.nav || []);
  // 标签列表
  const tabs = ref<TabsData[]>(storage?.tabs || []);
  // keep-alive 缓存组件名列表
  const cacheRoutes = ref<string[]>([]);
  // 最近关闭标签后需要跳转的路径（内部导航锁使用）
  const prevPath = ref('');

  // 持久化（tabs/activeKey/nav）
  const persist = () => {
    localStorage.setItem(
      TABS_STORAGE,
      JSON.stringify({
        activeKey: activeKey.value,
        nav: nav.value,
        tabs: tabs.value,
      }),
    );
  };

  /** 切换关闭标签锁 */
  const toggleCloseTabsLock = (value: boolean) => {
    isCloseTabsLock.value = value;
  };

  /** 切换最大化 */
  const toggleMaximize = (value: boolean) => {
    isMaximize.value = value;
  };

  /** 设置选中标签 */
  const setActiveKey = (value: string) => {
    activeKey.value = value;
    persist();
  };

  /** 设置面包屑 */
  const setNav = (value: NavData[]) => {
    nav.value = value;
    persist();
  };

  /** 切换标签语言 */
  const switchTabsLang = (lang: string) => {
    for (const item of tabs.value) {
      item.label = lang === 'en' ? item.labelEn : item.labelZh;
    }
  };

  /** 添加keep-alive缓存 */
  const addCacheRoutes = (name: string) => {
    if (name && !cacheRoutes.value.includes(name)) {
      cacheRoutes.value.push(name);
    }
  };

  /** 移除keep-alive缓存 */
  const removeCacheRoutes = (name: string) => {
    const index = cacheRoutes.value.indexOf(name);
    if (index >= 0) cacheRoutes.value.splice(index, 1);
  };

  /** 清空keep-alive缓存 */
  const clearCacheRoutes = () => {
    cacheRoutes.value = [];
  };

  /** 添加标签 */
  const addTabs = (payload: TabsData) => {
    const has = tabs.value.find((item) => item.key === payload.key);
    if (!has) tabs.value.push(payload);

    if (tabs.value.length) tabs.value[0].closable = tabs.value.length > 1;

    // 添加keep-alive缓存
    if (payload.cacheName) addCacheRoutes(payload.cacheName);

    persist();
  };

  /** 设置标签url参数 */
  const setTabs = (key: string, searchParams?: string) => {
    const has = tabs.value.find((item) => item.key === key);
    if (has) {
      has.urlParams = searchParams;
    }
    persist();
  };

  /** 标签排序 */
  const sortTabs = (payload: TabsData[]) => {
    tabs.value = payload;
    persist();
  };

  /** 关闭标签 */
  const closeTabs = (payload: string) => {
    const index = tabs.value.findIndex((item) => item.key === payload);
    if (index >= 0) {
      const [removed] = tabs.value.splice(index, 1);
      // 清除当前标签的keepalive缓存
      if (removed?.cacheName) removeCacheRoutes(removed.cacheName);
    }

    if (payload === activeKey.value) {
      let target: string;
      if (index < tabs.value.length) {
        target = tabs.value?.[index]?.key || '';
      } else {
        target = tabs.value[index - 1]?.key || '';
      }
      activeKey.value = target;
      isCloseTabsLock.value = true;
    }

    if (tabs.value.length) tabs.value[0].closable = tabs.value.length > 1;

    persist();
  };

  /** 关闭标签并跳转 */
  const closeTabGoNext = (payload: { key: string; nextPath: string }) => {
    const { key, nextPath } = payload;
    const index = tabs.value.findIndex((item) => item.key === key);
    if (index >= 0) {
      const [removed] = tabs.value.splice(index, 1);
      // 清除非当前的keepalive缓存
      if (removed?.cacheName) removeCacheRoutes(removed.cacheName);
    }

    if (key === activeKey.value) {
      activeKey.value = nextPath;
      isCloseTabsLock.value = true;
    }

    if (tabs.value.length) tabs.value[0].closable = tabs.value.length > 1;

    persist();
  };

  /** 关闭左侧标签 */
  const closeLeft = (payload: string) => {
    const index = tabs.value.findIndex((item) => item.key === payload);
    const removed = index >= 0 ? tabs.value.splice(0, index) : [];

    // 清除非当前的keepalive缓存
    for (const item of removed) {
      if (item.key !== payload && item.cacheName)
        removeCacheRoutes(item.cacheName);
    }

    activeKey.value = tabs.value[0]?.key || '';
    isCloseTabsLock.value = true;

    if (tabs.value.length) tabs.value[0].closable = tabs.value.length > 1;

    persist();
  };

  /** 关闭右侧标签 */
  const closeRight = (payload: string) => {
    const index = tabs.value.findIndex((item) => item.key === payload);
    const removed =
      index >= 0
        ? tabs.value.splice(index + 1, tabs.value.length - index - 1)
        : [];

    // 清除非当前的keepalive缓存
    for (const item of removed) {
      if (item.key !== payload && item.cacheName)
        removeCacheRoutes(item.cacheName);
    }

    activeKey.value = tabs.value[tabs.value.length - 1]?.key || '';
    isCloseTabsLock.value = true;

    if (tabs.value.length) tabs.value[0].closable = tabs.value.length > 1;

    persist();
  };

  /** 关闭其他标签 */
  const closeOther = (payload: string) => {
    const filteredTabs: TabsData[] = [];
    const removed: TabsData[] = [];

    for (const item of tabs.value) {
      // 保留当前标签
      if (item.key === payload) {
        filteredTabs.push(item);
      } else {
        removed.push(item);
      }
    }

    // 清除非当前的keepalive缓存
    for (const item of removed) {
      if (item.cacheName) removeCacheRoutes(item.cacheName);
    }

    tabs.value = filteredTabs;
    activeKey.value = payload;
    isCloseTabsLock.value = true;

    if (filteredTabs.length) filteredTabs[0].closable = filteredTabs.length > 1;

    persist();
  };

  /** 关闭全部标签 */
  const closeAllTab = () => {
    tabs.value = [];
    activeKey.value = '';
    clearCacheRoutes();
    persist();
  };

  return {
    isCloseTabsLock,
    isMaximize,
    activeKey,
    nav,
    tabs,
    cacheRoutes,
    prevPath,
    toggleCloseTabsLock,
    toggleMaximize,
    setActiveKey,
    setNav,
    switchTabsLang,
    addCacheRoutes,
    removeCacheRoutes,
    clearCacheRoutes,
    addTabs,
    setTabs,
    sortTabs,
    closeTabs,
    closeTabGoNext,
    closeLeft,
    closeRight,
    closeOther,
    closeAllTab,
  };
});
