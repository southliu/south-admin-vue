<script setup lang="ts">
import type { SideMenu } from '#/public';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getMenuByKey, getOpenMenuByRouter } from '@/menus/utils/helper';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useMenuStore } from '@/stores/menu';
import { useTabsStore } from '@/stores/tabs';

defineOptions({ name: 'SearchResult' });

const props = defineProps<{
  list: SideMenu[];
  active: string;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'changActive', value: string): void;
}>();

const { t } = useI18n();
const router = useRouter();
const { permissions, menuList } = useCommonStore();
const menuStore = useMenuStore();
const tabsStore = useTabsStore();

/**
 * 点击搜索项
 * @param item - 点击项
 */
const onClick = (item: SideMenu) => {
  router.push(item.key);

  // 添加标签
  const newTab = getMenuByKey({ menus: menuList.value, permissions: permissions.value, key: item.key });
  if (newTab) tabsStore.addTabs({ ...newTab, nav: newTab.nav.map((nav) => ({ ...nav })) });
  tabsStore.setActiveKey(item.key);

  // 处理菜单展开
  const openKeys = getOpenMenuByRouter(item.key);
  menuStore.setOpenKeys(openKeys);

  emit('cancel');
};
</script>

<template>
  <div v-if="list?.length" class="mt-10px max-h-300px overflow-auto">
    <div
      v-for="item in list"
      :key="item.key"
      :class="`
        flex
        items-center
        justify-between
        box-border
        w-full
        px-10px
        py-5px
        cursor-pointer
        ${active === item.key ? 'bg-#f5f5f5' : ''}
      `"
      @click="onClick(item)"
      @mouseenter="emit('changActive', item.key)"
    >
      <span class="flex items-center">
        <Icon v-if="item.icon" :icon="String(item.icon)" class="mr-8px text-lg" />
        {{ item.label }}
      </span>

      <Icon v-if="active === item.key" class="text-lg" icon="ant-design:enter-outlined" />
    </div>
  </div>

  <div v-else class="flex justify-center py-30px font-bold text-18px">
    {{ t('public.notSearchContent') }}
  </div>
</template>
