<script setup lang="ts">
import { useToken } from '@/hooks/useToken';
import { useCommonStore } from '@/hooks/useCommonStore';
import { getMenuList } from '@/servers/system/menu';
import { getUserRefreshPermissions } from '@/servers/system/user';
import { getFirstMenu } from '@/menus/utils/helper';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

defineOptions({ name: 'Index' });

const router = useRouter();
const { getToken } = useToken();
const { permissions, menuList, userStore, menuStore } = useCommonStore();

onMounted(async () => {
  const token = getToken();

  // 未登录跳转登录页
  if (!token) {
    router.push('/login');
    return;
  }

  // 权限或菜单不存在则重新获取
  if (!permissions.value?.length || !menuList.value?.length) {
    const [userResult, menuResult] = await Promise.all([
      getUserRefreshPermissions({ refresh_cache: false }),
      getMenuList(),
    ]);

    if (Number(userResult.code) === 200) {
      userStore.setUserInfo(userResult.data.user);
      userStore.setPermissions(userResult.data.permissions);
    }

    if (Number(menuResult.code) === 200) {
      menuStore.setMenuList(menuResult.data || []);
    }
  }

  // 跳转第一个有效菜单
  const firstMenu = getFirstMenu(menuList.value, permissions.value);
  if (firstMenu) {
    router.push(firstMenu);
  }
});
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <span class="text-gray-400">loading...</span>
  </div>
</template>
