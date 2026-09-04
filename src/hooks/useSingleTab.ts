import type { TabsData } from '@/stores/tabs';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getMenuByKey, getMenuName, getOpenMenuByRouter } from '@/menus/utils/helper';
import { ADD_TITLE, EDIT_TITLE } from '@/utils/config';
import { setTitle } from '@/utils/helper';
import { useCommonStore } from './useCommonStore';

interface Props {
  fatherPath: string;
  zhTitle: string;
  enTitle: string;
  name?: string;
}

/**
 * 单标签设置（独立页面的新增/编辑标签管理）
 * @param props - 参数
 */
export function useSingleTab(props: Props) {
  const { fatherPath, zhTitle, enTitle, name } = props;
  const { t, locale } = useI18n();
  const route = useRoute();
  const { isPhone, isCollapsed, menuList, permissions, menuStore, tabsStore } = useCommonStore();

  /** 获取路由对应名称 */
  const getNameByRoute = (): string => {
    const search = route.fullPath.replace(route.path, '');
    const params = search?.substring(1, search.length);
    const list = params?.split('&');

    for (let i = 0; i < list?.length; i++) {
      const item = list[i];
      const arr = item?.split('=');
      const key = arr?.[0];
      const value = arr?.[1];
      if (key === name) {
        return value;
      }
    }

    return '';
  };

  /** 获取标题 */
  const handleGetTitle = () => {
    const routeName = getNameByRoute();
    const lang = locale.value as string;
    const title = lang === 'zh' ? zhTitle : enTitle;
    let result = '';
    let newUpdateTitle = '';
    let newCreateTitle = '';

    if (!title) {
      const menuName = getMenuName(menuList.value, fatherPath, lang);
      newCreateTitle = `${title || ADD_TITLE(t)}${menuName}`;
      newUpdateTitle = `${EDIT_TITLE(t, routeName, menuName)}`;
    } else {
      const label = routeName ? `(${routeName})` : '';
      newCreateTitle = `${title || ADD_TITLE(t)}${label}`;
      newUpdateTitle = `${title}${label}`;
    }
    result = routeName ? newUpdateTitle : newCreateTitle;
    return result;
  };

  /** 初始化操作 */
  const handleInit = () => {
    const title = handleGetTitle();
    setTitle(t, title);
    const newOpenKey = getOpenMenuByRouter(fatherPath);
    if (!isPhone.value && !isCollapsed.value) {
      menuStore.setOpenKeys(newOpenKey);
      menuStore.setSelectedKeys(fatherPath);
    }
  };

  /** 添加标签 */
  const handleAddTab = () => {
    const path = route.path + (route.fullPath.replace(route.path, '') || '');
    if (path === '/') return;

    const lang = locale.value as string;
    const title = lang === 'zh' ? zhTitle : enTitle;
    const currentTitle = handleGetTitle();
    const newNav = getMenuByKey({ menus: menuList.value, permissions: permissions.value, key: fatherPath })?.nav || [];
    newNav.push({
      label: title,
      labelZh: zhTitle,
      labelEn: enTitle,
    });

    const matched = route.matched[route.matched.length - 1];
    const newTab: TabsData = {
      label: currentTitle,
      labelEn: enTitle,
      labelZh: zhTitle,
      key: path,
      nav: newNav,
      urlParams: route.fullPath.replace(route.path, ''),
      cacheName: matched?.name ? String(matched.name) : undefined,
    };
    tabsStore.setActiveKey(newTab.key);
    tabsStore.setNav(newTab.nav);
    tabsStore.addTabs(newTab);
  };

  handleAddTab();
  handleInit();

  return {
    handleAddTab,
    handleInit,
    handleGetTitle,
  };
}
