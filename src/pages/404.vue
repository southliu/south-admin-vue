<script setup lang="ts">
import { Button } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getFirstMenu } from '@/menus/utils/helper';
import { getMenuList } from '@/servers/system/menu';
import { getUserRefreshPermissions } from '@/servers/system/user';
import { useCommonStore } from '@/hooks/useCommonStore';
import styles from './all.module.less';

defineOptions({ name: 'NotFound' });

const { t } = useI18n();
const router = useRouter();
const { permissions, menuList, userStore, menuStore } = useCommonStore();

/** 返回首页 */
const onGoHome = async () => {
  let perms = permissions.value;
  let menus = menuList.value;

  // 权限或菜单不存在则重新获取
  if (!perms?.length || !menus?.length) {
    const [userResult, menuResult] = await Promise.all([
      getUserRefreshPermissions({ refresh_cache: false }),
      getMenuList(),
    ]);

    if (Number(userResult.code) === 200) {
      userStore.setUserInfo(userResult.data.user);
      userStore.setPermissions(userResult.data.permissions);
      perms = userResult.data.permissions;
    }

    if (Number(menuResult.code) === 200) {
      menuStore.setMenuList(menuResult.data || []);
      menus = menuResult.data || [];
    }
  }

  const firstMenu = getFirstMenu(menus, perms);
  if (firstMenu) router.push(firstMenu);
};
</script>

<template>
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
    <h1 :class="styles.animation" class="w-full text-6rem font-bold">404</h1>
    <p class="mt-15px w-full text-20px font-bold">{{ t('public.notFindMessage') }}</p>
    <Button class="mt-25px" @click="onGoHome">
      {{ t('public.returnHome') }}
    </Button>
  </div>
</template>
