import { TOKEN } from '@/utils/config';
import { creteRequest } from './request';

// 生成环境所用的接口
const prefixUrl = import.meta.env.VITE_BASE_URL as string;
const baseURL = import.meta.env.PROD ? prefixUrl : '/api';

// 业务侧统一请求实例（get/post/put/patch/delete）
export const request = creteRequest(baseURL, TOKEN, {
  // 权限过期处理：当前使用 hash 路由，改 hash 后需 reload
  onAuthExpired: () => {
    const isHashRouter = window.location.hash.startsWith('#');
    const currentRoute = isHashRouter
      ? window.location.hash.slice(1)
      : `${window.location.pathname}${window.location.search}`;

    // 已在登录页（含带 redirect 参数）时不再跳转，避免并发 401 把 redirect 参数嵌套
    if (currentRoute.startsWith('/login')) return;

    const redirect = currentRoute ? `?redirect=${currentRoute}` : '';
    const loginPath = `/login${redirect}`;

    if (isHashRouter) {
      window.location.hash = loginPath;
      window.location.reload();
    } else {
      window.location.href = loginPath;
    }
  },
});

/**
 * 取消请求
 * @param url - 链接
 */
export const cancelRequest = (url: string | string[]) => {
  return request.cancelRequest(url);
};

/** 取消全部请求 */
export const cancelAllRequest = () => {
  return request.cancelAllRequest();
};
