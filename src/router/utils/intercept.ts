import type { Router } from 'vue-router';
import nprogress from 'nprogress';
import { useToken } from '@/hooks/useToken';

// 隐藏进度环
nprogress.configure({ showSpinner: false });

/**
 * 路由拦截器
 * @param router - 路由实例
 */
export function routerIntercept(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    nprogress.start();

    const { getToken } = useToken();
    const token = getToken();

    // 未登录跳转登录页
    if (!token && to.path !== '/login') {
      const redirect = to.fullPath && to.fullPath !== '/' ? `?redirect=${to.fullPath}` : '';
      return next(`/login${redirect}`);
    }

    // 已登录访问登录页则跳转首页（首页会重定向至第一个有效菜单）
    if (token && to.path === '/login') {
      const redirect = to.query.redirect as string;
      return next(redirect || '/');
    }

    next();
  });

  router.afterEach(() => {
    nprogress.done();
  });
}
