import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { handleRoutes } from './utils/helper';

// pages目录自动生成路由（懒加载）
const pageModules = import.meta.glob('../pages/**/*.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
  },
  {
    path: '/forget',
    name: 'Forget',
    component: () => import('@/pages/forget/index.vue'),
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/index.vue'),
    children: [
      // 根页面（重定向至第一个有效菜单）
      {
        path: '/',
        name: 'Index',
        component: () => import('@/pages/index.vue'),
      },
      // pages目录自动生成的子路由
      ...handleRoutes(pageModules),
      // 404
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/404.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export default router;
