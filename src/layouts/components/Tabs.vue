<script setup lang="ts">
import type { TabsData } from '@/stores/tabs';
import type { MenuProps } from 'ant-design-vue';
import { Dropdown, TabPane, Tabs } from 'ant-design-vue';
import Sortable from 'sortablejs';
import { useI18n } from 'vue-i18n';
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getMenuByKey, getOpenMenuByRouter } from '@/menus/utils/helper';
import { useDropdownMenu } from '../hooks/useDropdownMenu';
import { useCommonStore } from '@/hooks/useCommonStore';
import { getTabTitle } from '../utils/helper';
import { setTitle } from '@/utils/helper';
import { message } from '@/utils/message';
import styles from '../index.module.less';
import TabRefresh from './TabRefresh.vue';
import TabMaximize from './TabMaximize.vue';
import TabOptions from './TabOptions.vue';

defineOptions({ name: 'LayoutTabs' });

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { permissions, isMaximize, menuList, menuStore, tabsStore, publicStore } =
  useCommonStore();

let timer: ReturnType<typeof setTimeout> | null = null;
let sortable: Sortable | null = null;

// 下拉菜单
const { items, onClick } = useDropdownMenu({
  activeKey: tabsStore.activeKey,
  handleRefresh: (key: string) => onClickRefresh(key),
});

/**
 * 右键菜单属性
 * @param tab - 标签数据
 */
const contextMenu = (tab: TabsData): { menu: MenuProps } => ({
  menu: {
    items: items(tab.key),
    onClick: (e) => onClick(String(e.key), tab.key),
  },
});

/**
 * 添加标签（路由变化时同步）
 */
const handleAddTab = (path = route.path) => {
  if (!permissions.value.length || path === '/') return;

  const newItems = getMenuByKey({
    menus: menuList.value,
    permissions: permissions.value,
    key: path,
  });

  if (newItems?.key) {
    const matched = route.matched[route.matched.length - 1];
    const newTab: TabsData = {
      ...newItems,
      nav: newItems.nav.map((item) => ({ ...item })),
      cacheName: matched?.name ? String(matched.name) : undefined,
    };
    tabsStore.setActiveKey(newItems.key);
    tabsStore.setNav(newItems.nav);
    tabsStore.addTabs(newTab);

    // 路由变化同步浏览器标题
    const title =
      locale.value === 'en'
        ? newItems.labelEn
        : newItems.labelZh || newItems.label;
    if (title) setTitle(t, title);
  } else {
    tabsStore.setActiveKey(path);
  }
};

// 路由变化时同步标签
watch(
  () => route.path,
  () => handleAddTab(),
  { immediate: true },
);

// 语言切换同步标签
watch(locale, (lang) => {
  tabsStore.switchTabsLang(lang);
});

/**
 * 标签显示名
 * @param tab - 标签数据
 */
const tabLabel = (tab: TabsData) => String(tab.label ?? tab.labelZh);

/**
 * 路由跳转
 * @param key - 标签key
 */
const handleNavigateTo = (key: string) => {
  // 立即更新选中状态
  tabsStore.setActiveKey(key);

  const urlParams =
    tabsStore.tabs.find((tab) => tab.key === key)?.urlParams || '';
  router.push(key.includes('?') ? key : `${key}${urlParams}`);

  // 刷新标题
  const title = getTabTitle(tabsStore.tabs, key);
  if (title) setTitle(t, title);
};

/**
 * 标签切换
 * @param key - 标签key
 */
const onChange = (key: string | number) => {
  const path = String(key);
  // 菜单操作
  const newOpenKey = getOpenMenuByRouter(path);
  menuStore.setOpenKeys(newOpenKey);
  menuStore.setSelectedKeys(path);

  handleNavigateTo(path);
};

/**
 * 删除标签
 * @param targetKey - 目标key值
 */
const remove = (targetKey: string) => {
  // 如果删除的是当前选中的，则跳转至上一个
  if (tabsStore.activeKey === targetKey) {
    const currentIndex = tabsStore.tabs.findIndex(
      (tab) => tab.key === tabsStore.activeKey,
    );
    const nextPath =
      tabsStore.tabs[currentIndex > 0 ? currentIndex - 1 : 1]?.key;
    if (nextPath) {
      router.push(nextPath);
    }
  }

  tabsStore.closeTabs(targetKey);
};

/**
 * 处理编辑
 * @param targetKey - 目标key值
 * @param action - 动作
 */
const onEdit = (
  targetKey: string | number | MouseEvent | KeyboardEvent,
  action: 'add' | 'remove',
) => {
  if (
    action === 'remove' &&
    (typeof targetKey === 'string' || typeof targetKey === 'number')
  ) {
    remove(String(targetKey));
  }
};

/**
 * 刷新标签（keep-alive缓存重建）
 * @param key - 标签key
 */
const onClickRefresh = async (key = tabsStore.activeKey) => {
  if (typeof key !== 'string' || !key) return;
  if (timer) return;

  const tab = tabsStore.tabs.find((item) => item.key === key);
  const cacheName = tab?.cacheName;

  publicStore.setRefresh(true);

  publicStore.refreshRoute(key.split('?')[0]);

  // 清除keep-alive缓存并强制重建视图
  if (cacheName) {
    tabsStore.removeCacheRoutes(cacheName);

    await nextTick();
    tabsStore.addCacheRoutes(cacheName);
  }

  timer = setTimeout(() => {
    message.success({
      content: t('public.refreshSuccessfully'),
      key: 'refresh',
    });
    publicStore.setRefresh(false);
    timer = null;
  }, 300);
};

/**
 * 初始化标签拖拽排序
 */
const initSortable = () => {
  const navList = document.querySelector(
    '.layout-tabs .ant-tabs-nav-list',
  ) as HTMLElement;
  if (!navList || sortable) return;

  sortable = Sortable.create(navList, {
    animation: 150,
    filter: '.ant-tabs-tab-remove',
    onEnd({ oldIndex, newIndex }) {
      if (
        oldIndex === newIndex ||
        oldIndex === undefined ||
        newIndex === undefined
      )
        return;

      const newTabs = [...tabsStore.tabs];
      const [moved] = newTabs.splice(oldIndex, 1);
      newTabs.splice(newIndex, 0, moved);
      tabsStore.sortTabs(newTabs);
    },
  });
};

onMounted(() => {
  initSortable();
});

// 标签列表变化后重新绑定拖拽（容器可能重新渲染）
watch(
  () => tabsStore.tabs.length,
  async () => {
    await nextTick();
    sortable?.destroy();
    sortable = null;
    initSortable();
  },
);

onBeforeUnmount(() => {
  sortable?.destroy();
  sortable = null;
  if (timer) clearTimeout(timer);
  publicStore.setRefresh(false);
});
</script>

<template>
  <div
    :class="`
      mr-2
      w-[calc(100%-5px)]
      transition-all
      ${isMaximize ? styles['con-maximize'] : ''}
    `"
  >
    <Tabs
      v-if="tabsStore.tabs.length > 0"
      class="layout-tabs h-30px py-0"
      :class="styles['layout-tabs']"
      hide-add
      :active-key="tabsStore.activeKey"
      type="editable-card"
      @change="onChange"
      @edit="onEdit as never"
    >
      <TabPane
        v-for="tab in tabsStore.tabs"
        :key="tab.key"
        :closable="tab.closable"
      >
        <template #tab>
          <Dropdown v-bind="contextMenu(tab)" trigger="contextmenu">
            <span class="select-none" :title="tabLabel(tab)">{{
              tabLabel(tab)
            }}</span>
          </Dropdown>
        </template>
      </TabPane>

      <!-- 右侧操作区 -->
      <template #rightExtra>
        <div class="flex">
          <div
            class="left-divide-tab change divide-solid w-36px h-36px hover:opacity-70 flex place-content-center items-center"
          >
            <TabRefresh
              :is-refresh="publicStore.isRefresh"
              @on-click="() => onClickRefresh()"
            />
          </div>
          <div
            class="left-divide-tab change divide-solid w-36px h-36px hover:opacity-70 flex place-content-center items-center"
          >
            <TabOptions
              :active-key="tabsStore.activeKey"
              :handle-refresh="onClickRefresh"
            />
          </div>
          <div
            class="left-divide-tab change divide-solid w-36px h-36px hover:opacity-70 flex place-content-center items-center"
          >
            <TabMaximize />
          </div>
        </div>
      </template>
    </Tabs>
  </div>
</template>
