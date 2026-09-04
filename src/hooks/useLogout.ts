import { cancelAllRequest } from '@/servers';
import { useRouter } from 'vue-router';
import { useMenuStore } from '@/stores/menu';
import { useTabsStore } from '@/stores/tabs';
import { useUserStore } from '@/stores/user';
import { useToken } from './useToken';

/**
 * 退出登录
 */
export function useLogout() {
  const router = useRouter();
  const { removeToken } = useToken();
  const userStore = useUserStore();
  const menuStore = useMenuStore();
  const tabsStore = useTabsStore();

  /** 处理退出登录 */
  const handleLogout = () => {
    // 取消全部请求
    cancelAllRequest();
    sessionStorage.removeItem('layout-bootstrap');

    // 清理store
    userStore.clearInfo();
    userStore.setPermissions([]);
    menuStore.setMenuList([]);
    tabsStore.closeAllTab();
    tabsStore.setActiveKey('');
    tabsStore.setNav([]);

    // 清除token并跳转登录页
    removeToken();
    router.push('/login');
  };

  return { handleLogout };
}
