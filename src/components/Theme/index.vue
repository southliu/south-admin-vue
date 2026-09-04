<script setup lang="ts">
import { Tooltip } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { usePublicStore } from '@/stores/public';
import { THEME_KEY } from '@/utils/config';
import './index.module.less';

defineOptions({ name: 'Theme' });

const { t } = useI18n();
const publicStore = usePublicStore();

// 初始化主题（缓存优先）
const themeCache = (localStorage.getItem(THEME_KEY) || 'light') as 'dark' | 'light';
if (themeCache === 'dark') {
  document.body.className = 'theme-dark';
}
publicStore.setThemeValue(themeCache === 'dark' ? 'dark' : 'light');

/**
 * 切换主题
 */
const toggleThemeScheme = (type: 'dark' | 'light') => {
  localStorage.setItem(THEME_KEY, type);
  publicStore.setThemeValue(type);

  document.body.className = type === 'dark' ? 'theme-dark' : 'theme-primary';
};

/**
 * 处理更新（View Transition 圆形扩散动画）
 * @param e - 事件
 * @param type - 主题类型
 */
const onChange = (e: MouseEvent, type: 'dark' | 'light') => {
  const transition = document.startViewTransition(() => {
    toggleThemeScheme(type);
  });

  transition.ready.then(() => {
    // 获取鼠标的坐标
    const { clientX, clientY } = e;

    // 计算最大半径
    const radius = Math.hypot(
      Math.max(clientX, innerWidth - clientX),
      Math.max(clientY, innerHeight - clientY),
    );

    // 圆形动画扩散
    document.documentElement.animate(
      [
        { clipPath: `circle(0% at ${clientX}px ${clientY}px)` },
        { clipPath: `circle(${radius}px at ${clientX}px ${clientY}px)` },
      ],
      {
        duration: 400,
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
};
</script>

<template>
  <Tooltip :title="t('public.themes')">
    <div class="mr-4 flex cursor-pointer items-center justify-center text-17px">
      <div v-show="publicStore.theme === 'light'" @click="onChange($event, 'dark')">
        <Icon icon="mdi-white-balance-sunny" />
      </div>
      <div v-show="publicStore.theme !== 'light'" @click="onChange($event, 'light')">
        <Icon icon="mdi-moon-waning-crescent" />
      </div>
    </div>
  </Tooltip>
</template>
