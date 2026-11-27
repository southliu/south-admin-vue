import { TOKEN } from '@/utils/config';
import { creteRequest } from './request';

// 生成环境所用的接口
const prefixUrl = import.meta.env.VITE_BASE_URL as string;
const baseURL = import.meta.env.PROD ? prefixUrl : '/api';

// 业务侧统一请求实例（get/post/put/patch/delete）
export const request = creteRequest(baseURL, TOKEN, {
  onAuthExpired: () => {
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (window.location.pathname === '/login') return;
    window.location.assign(`/login?redirect=${encodeURIComponent(current)}`);
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
