<script setup lang="ts">
import ContentLoading from './components/ContentLoading.vue';
import { Button, Result } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { resolveErrorMessage } from '@/servers/request';
import axios from 'axios';
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import nprogress from 'nprogress';
import { useToken } from '@/hooks/useToken';
import { useCommonStore } from '@/hooks/useCommonStore';
import { getMenuList } from '@/servers/system/menu';
import { getUserRefreshPermissions } from '@/servers/system/user';
import Menu from './components/Menu.vue';
import Header from './components/Header.vue';
import Tabs from './components/Tabs.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import styles from './index.module.less';

defineOptions({ name: 'Layout' });

const Forbidden = defineAsyncComponent(() => import('@/pages/403.vue'));

const route = useRoute();
const { getToken } = useToken();
const {
  permissions,
  userId,
  isMaximize,
  isCollapsed,
  isPhone,
  menuList,
  userStore,
  menuStore,
  tabsStore,
  publicStore,
} = useCommonStore();

const { t } = useI18n();
const isLoading = ref(true);
const loadError = ref('');

/** 用户与菜单独立加载，失败可重试；旧会话响应不能覆盖新会话。 */
const loadData = async () => {
  const token = getToken();
  if (!token) return;
  isLoading.value = true;
  loadError.value = '';
  const tasks: Promise<unknown>[] = [];
  if (!userId.value || !permissions.value.length) {
    tasks.push(
      getUserRefreshPermissions({ refresh_cache: false }).then((response) => {
        if (Number(response.code) !== 200)
          throw new Error(
            resolveErrorMessage(response, t('public.networkError')),
          );
        if (getToken() !== token) return;
        userStore.setUserInfo(response.data.user);
        userStore.setPermissions(response.data.permissions);
      }),
    );
  }
  if (!menuList.value.length) {
    tasks.push(
      getMenuList().then((response) => {
        if (Number(response.code) !== 200)
          throw new Error(
            resolveErrorMessage(response, t('public.networkError')),
          );
        if (getToken() === token) menuStore.setMenuList(response.data || []);
      }),
    );
  }
  const results = await Promise.allSettled(tasks);
  if (getToken() !== token) return;
  const failure = results.find((result) => result.status === 'rejected');
  if (failure?.status === 'rejected') {
    const reason = failure.reason;
    loadError.value = axios.isAxiosError(reason)
      ? resolveErrorMessage(reason.response?.data, t('public.networkError'))
      : reason instanceof Error
        ? reason.message
        : t('public.networkError');
  }
  isLoading.value = false;
};
onMounted(loadData);

// 路由变化时关闭进度条
watch(
  () => route.path,
  () => {
    nprogress?.done();
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
const hasData = computed(
  () => permissions.value.length > 0 && menuList.value.length > 0,
);
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
        <ContentLoading v-if="isLoading || publicStore.isRouteLoading" />
        <Result v-else-if="loadError" status="error" :title="loadError">
          <template #extra
            ><Button type="primary" @click="loadData">{{
              t('public.reload')
            }}</Button></template
          >
        </Result>

        <!-- 无权限 -->
        <Forbidden
          v-if="!isLoading && !loadError && permissions.length === 0"
        />

        <!-- 页面内容（keep-alive + 错误边界；不套 Transition：隐藏/后台 WebView 中 rAF 暂停会卡死过渡导致页面不可见） -->
        <RouterView v-if="!isLoading && !loadError" v-slot="{ Component }">
          <ErrorBoundary>
            <KeepAlive :include="tabsStore.cacheRoutes" :max="10">
              <component
                :is="Component"
                v-if="permissions.length > 0 && Component"
                v-show="!publicStore.isRouteLoading"
                :key="viewKey"
              />
            </KeepAlive>
          </ErrorBoundary>
        </RouterView>
      </div>
    </div>
  </div>
</template>
