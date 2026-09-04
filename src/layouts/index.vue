<script setup lang="ts">
import { Skeleton } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { KeepAlive, computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import nprogress from 'nprogress';
import { useToken } from '@/hooks/useToken';
import { useCommonStore } from '@/hooks/useCommonStore';
import { getMenuList } from '@/servers/system/menu';
import { getUserRefreshPermissions } from '@/servers/system/user';
import { versionCheck } from './utils/helper';
import Menu from './components/Menu.vue';
import Header from './components/Header.vue';
import Tabs from './components/Tabs.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import styles from './index.module.less';

defineOptions({ name: 'Layout' });

const Forbidden = defineAsyncComponent(() => import('@/pages/403.vue'));

const { t } = useI18n();
const route = useRoute();
const { getToken } = useToken();
const { permissions, userId, isMaximize, isCollapsed, isPhone, menuList, userStore, menuStore, tabsStore, publicStore } =
  useCommonStore();

const isLoading = ref(true);

/**
 * 获取用户信息和权限
 */
const getUserInfo = async () => {
  try {
    const { code, data } = await getUserRefreshPermissions({ refresh_cache: false });
    if (Number(code) !== 200) return;
    const { user, permissions: perms } = data;
    userStore.setUserInfo(user);
    userStore.setPermissions(perms);
  } catch (err) {
    console.error('获取用户数据失败:', err);
    userStore.setPermissions([]);
  }
};

/**
 * 获取菜单数据
 */
const getMenuData = async () => {
  const { code, data } = await getMenuList();
  if (Number(code) !== 200) return;
  menuStore.setMenuList(data || []);
};

onMounted(() => {
  // 当用户信息缓存不存在时则重新获取
  const token = getToken();
  if (token && !userId) {
    isLoading.value = true;
    Promise.all([getUserInfo(), getMenuData()]).finally(() => {
      isLoading.value = false;
    });
  } else {
    isLoading.value = false;
  }

  // 监测是否需要刷新（版本检查）
  requestAnimationFrame(() => {
    versionCheck(t);
  });
});

// 路由变化时关闭进度条 + 版本检查
watch(
  () => route.path,
  () => {
    nprogress?.done();

    requestAnimationFrame(() => {
      versionCheck(t);
    });
  },
);

/**
 * 判断是否是手机端
 */
const handleIsPhone = useDebounceFn(() => {
  const value = window.innerWidth <= 768;
  // 手机首次进来收缩菜单
  if (value) menuStore.toggleCollapsed(true);
  menuStore.togglePhone(value);
}, 500);

onMounted(() => {
  handleIsPhone();
  window.addEventListener('resize', handleIsPhone);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleIsPhone);
  setTimeout(() => {
    nprogress?.done();
  }, 300);
});

// 视图缓存key（含刷新计数，用于强制重建组件）
const viewKey = computed(() => {
  const refreshCount = publicStore.refreshKeys[route.path] || 0;
  return `${route.path}#${refreshCount}`;
});

// 是否有数据（渲染菜单与标签）
const hasData = computed(() => permissions.value.length > 0 && menuList.value.length > 0);
</script>

<template>
  <div id="layout">
    <Menu v-if="hasData" />

    <div class="layout_right">
      <div
        id="header"
        :class="`
          border-bottom
          transition-all
          z-50!
          ${styles.header}
          ${isCollapsed ? styles['header-close-menu'] : ''}
          ${isMaximize ? styles['header-none'] : ''}
          ${isPhone ? '!left-0 z-999' : ''}
        `"
      >
        <Header />
        <Tabs v-if="hasData" />
      </div>

      <div
        id="layout-content"
        :class="`
          overflow-auto
          transition-all
          ${styles.con}
          ${isMaximize ? styles['con-maximize'] : ''}
          ${isCollapsed ? styles['con-close-menu'] : ''}
          ${isPhone ? '!left-0 !w-full' : ''}
        `"
      >
        <!-- 加载中骨架屏 -->
        <Skeleton
          v-if="isLoading && permissions.length === 0"
          active
          class="p-30px"
          :paragraph="{ rows: 10 }"
        />

        <!-- 无权限 -->
        <Forbidden v-if="!isLoading && permissions.length === 0" />

        <!-- 页面内容（keep-alive + 错误边界；不套 Transition：隐藏/后台 WebView 中 rAF 暂停会卡死过渡导致页面不可见） -->
        <RouterView v-slot="{ Component }">
          <ErrorBoundary>
            <KeepAlive :include="tabsStore.cacheRoutes" :max="10">
              <component :is="Component" v-if="permissions.length > 0 && Component" :key="viewKey" />
            </KeepAlive>
          </ErrorBoundary>
        </RouterView>
      </div>
    </div>
  </div>
</template>
