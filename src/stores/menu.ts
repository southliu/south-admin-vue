import type { SideMenu } from '#/public';
import { defineStore } from 'pinia';
import { ref } from 'vue';

/** 菜单store */
export const useMenuStore = defineStore('menu', () => {
  // 是否手机端
  const isPhone = ref(false);
  // 是否折叠菜单
  const isCollapsed = ref(false);
  // 菜单选中值
  const selectedKeys = ref('');
  // 菜单展开项
  const openKeys = ref<string[]>([]);
  // 菜单列表数据
  const menuList = ref<SideMenu[]>([]);

  /** 切换折叠菜单 */
  const toggleCollapsed = (value: boolean) => {
    isCollapsed.value = value;
  };

  /** 切换手机端 */
  const togglePhone = (value: boolean) => {
    isPhone.value = value;
  };

  /** 设置菜单选中值 */
  const setSelectedKeys = (value: string) => {
    selectedKeys.value = value;
  };

  /** 设置菜单展开项 */
  const setOpenKeys = (value: string[]) => {
    openKeys.value = value;
  };

  /** 设置菜单数据 */
  const setMenuList = (value: SideMenu[]) => {
    menuList.value = value;
  };

  return {
    isPhone,
    isCollapsed,
    selectedKeys,
    openKeys,
    menuList,
    toggleCollapsed,
    togglePhone,
    setSelectedKeys,
    setOpenKeys,
    setMenuList,
  };
});
