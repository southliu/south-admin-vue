import { defineStore } from 'pinia';
import { ref } from 'vue';
import { THEME_KEY } from '@/utils/config';

export type ThemeType = 'dark' | 'light';

/** 公共store（主题/全屏/刷新） */
export const usePublicStore = defineStore('public', () => {
  // 主题（默认跟随本地缓存）
  const theme = ref<ThemeType>(
    (localStorage.getItem(THEME_KEY) as ThemeType) || 'light',
  );
  // 是否全屏
  const isFullscreen = ref(false);
  // 是否刷新中（标签刷新动画）
  const isRefresh = ref(false);
  const isRouteLoading = ref(false);
  // 是否刷新页面（独立页提交后返回列表刷新标记）
  const isRefreshPage = ref(false);
  // 页面重载计数（keep-alive 强制重建视图）
  const refreshKeys = ref<Record<string, number>>({});

  /** 设置主题 */
  const setThemeValue = (value: ThemeType) => {
    theme.value = value;
  };

  /** 设置全屏 */
  const setFullscreen = (value: boolean) => {
    isFullscreen.value = value;
  };

  /** 设置刷新状态 */
  const setRefresh = (value: boolean) => {
    isRefresh.value = value;
  };

  /** 设置页面刷新标记 */
  const setRefreshPage = (value: boolean) => {
    isRefreshPage.value = value;
  };

  /** 刷新指定路由视图（bump key 强制重建组件） */
  const refreshRoute = (path: string) => {
    refreshKeys.value = {
      ...refreshKeys.value,
      [path]: (refreshKeys.value[path] || 0) + 1,
    };
  };

  return {
    theme,
    isFullscreen,
    isRefresh,
    isRouteLoading,
    isRefreshPage,
    refreshKeys,
    setThemeValue,
    setFullscreen,
    setRefresh,
    setRefreshPage,
    refreshRoute,
  };
});
