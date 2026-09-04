<script setup lang="ts">
import type { MenuProps } from 'ant-design-vue';
import { ExclamationCircleOutlined, FormOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { Dropdown } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { h, useTemplateRef } from 'vue';
import Avatar from '@/assets/images/avatar.png';
import styles from '../index.module.less';
import Fullscreen from '@/components/Fullscreen/index.vue';
import GlobalSearch from '@/components/GlobalSearch/index.vue';
import Github from '@/components/Github/index.vue';
import I18n from '@/components/I18n/index.vue';
import Theme from '@/components/Theme/index.vue';
import UpdatePassword from './UpdatePassword.vue';
import Nav from './Nav.vue';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useLogout } from '@/hooks/useLogout';
import { modal } from '@/utils/message';

defineOptions({ name: 'LayoutHeader' });

type MenuKey = 'password' | 'logout';

const { t } = useI18n();
const { handleLogout } = useLogout();
const { isCollapsed, isMaximize, username, name, nav, menuStore } = useCommonStore();

// 修改密码弹窗
const passwordRef = useTemplateRef<{ open: () => void }>('passwordRef');

// 下拉菜单内容
const items: MenuProps['items'] = [
  {
    key: 'password',
    label: t('public.changePassword'),
    icon: () => h(FormOutlined, { class: 'mr-1' }),
  },
  {
    key: 'logout',
    label: t('public.signOut'),
    icon: () => h(LogoutOutlined, { class: 'mr-1' }),
  },
];

/**
 * 点击菜单
 * @param e - 菜单事件
 */
const onClick: MenuProps['onClick'] = (e) => {
  switch (e.key as MenuKey) {
    case 'password':
      passwordRef.value?.open();
      break;

    case 'logout':
      onLogout();
      break;

    default:
      break;
  }
};

/** 退出登录 */
const onLogout = () => {
  modal.confirm({
    title: t('public.kindTips'),
    icon: h(ExclamationCircleOutlined),
    content: t('public.signOutMessage'),
    onOk() {
      handleLogout();
    },
  });
};
</script>

<template>
  <header
    :class="`
      border-bottom
      flex
      items-center
      justify-between
      px-6
      py-6px
      box-border
      transition-all
      ${styles['header-driver']}
      ${isMaximize ? styles.none : ''}
    `"
  >
    <div class="flex items-center">
      <!-- 折叠按钮 -->
      <div
        class="cursor-pointer text-lg"
        @click="menuStore.toggleCollapsed(!isCollapsed)"
      >
        <MenuUnfoldOutlined v-if="isCollapsed" />
        <MenuFoldOutlined v-else />
      </div>

      <!-- 面包屑 -->
      <Nav class="ml-15px" :list="nav" />
    </div>

    <!-- 右侧功能区 -->
    <div class="flex items-center">
      <Github />
      <GlobalSearch />
      <Fullscreen />
      <I18n />
      <Theme />

      <!-- 头像下拉 -->
      <Dropdown class="min-w-50px" :menu="{ items, onClick }">
        <div class="ant-dropdown-link flex cursor-pointer items-center" @click.prevent>
          <img
            :src="Avatar"
            width="27"
            height="27"
            alt="Avatar"
            class="rounded-1/2 overflow-hidden object-cover bg-light-500"
          />
          <span class="ml-2 min-w-50px truncate text-15px">
            {{ name || username || 'south-admin' }}
          </span>
        </div>
      </Dropdown>
    </div>
  </header>

  <UpdatePassword ref="passwordRef" />
</template>
