import axios from 'axios';
import type {
  AxiosResponse,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';
import type { RequestInterceptors, CreateRequestConfig, ServerResult } from './types';

interface NewAxiosRequestConfig extends AxiosRequestConfig {
  _mapKey?: string;
}

class AxiosRequest {
  // axios 实例
  instance: AxiosInstance;
  // 拦截器对象
  interceptorsObj?: RequestInterceptors<AxiosResponse>;
  // 存放取消请求控制器Map
  abortControllerMap: Map<string, AbortController>;

  constructor(config: CreateRequestConfig) {
    this.instance = axios.create(config);
    // 初始化存放取消请求控制器Map
    this.abortControllerMap = new Map();
    this.interceptorsObj = config.interceptors;

    // 拦截器执行顺序 接口请求 -> 实例请求 -> 全局请求 -> 实例响应 -> 全局响应 -> 接口响应
    this.instance.interceptors.request.use(
      (res: InternalAxiosRequestConfig) => {
        const controller = new AbortController();
        res.signal = controller.signal;

        const mapKey = this.generateMapKey(res);
        // 保存key到请求配置中，供响应拦截器使用
        (res as NewAxiosRequestConfig)._mapKey = mapKey;

        // 如果存在则删除该请求（重复请求去重）
        if (this.abortControllerMap.get(mapKey)) {
          console.warn('取消重复请求：', mapKey);
          this.cancelRequest(mapKey);
        } else {
          this.abortControllerMap.set(mapKey, controller);
        }

        return res;
      },
      (err: object) => err,
    );

    // 使用实例拦截器
    this.instance.interceptors.request.use(
      this.interceptorsObj?.requestInterceptors,
      this.interceptorsObj?.requestInterceptorsCatch,
    );
    this.instance.interceptors.response.use(
      this.interceptorsObj?.responseInterceptors,
      this.interceptorsObj?.responseInterceptorsCatch,
    );
    // 全局响应拦截器保证最后执行
    this.instance.interceptors.response.use(
      // 接口的数据都在res.data下，直接返回res.data
      (res: AxiosResponse) => {
        const mapKey = (res.config as NewAxiosRequestConfig)._mapKey || '';
        this.abortControllerMap.delete(mapKey);
        return res.data;
      },
      (err: object) => err,
    );
  }

  /**
   * 取消全部请求
   */
  cancelAllRequest() {
    for (const [, controller] of this.abortControllerMap) {
      controller.abort();
    }
    this.abortControllerMap.clear();
  }

  /**
   * 取消指定的请求
   * @param url - 待取消的请求URL
   */
  cancelRequest(url: string | string[]) {
    const urlList = Array.isArray(url) ? url : [url];
    for (const _url of urlList) {
      this.abortControllerMap.get(_url)?.abort();
      this.abortControllerMap.delete(_url);
    }
  }

  /**
   * get请求
   * @param url - 链接
   * @param options - 参数
   */
  get<T = object>(url: string, options = {}) {
    return this.instance.get(url, options) as Promise<ServerResult<T>>;
  }

  /**
   * post请求
   * @param url - 链接
   * @param options - 参数
   */
  post<T = object>(url: string, options = {}, config?: AxiosRequestConfig) {
    return this.instance.post(url, options, config) as Promise<ServerResult<T>>;
  }

  /**
   * put请求
   * @param url - 链接
   * @param options - 参数
   */
  put<T = object>(url: string, options = {}, config?: AxiosRequestConfig) {
    return this.instance.put(url, options, config) as Promise<ServerResult<T>>;
  }

  /**
   * patch请求
   * @param url - 链接
   * @param options - 参数
   */
  patch<T = object>(url: string, options = {}, config?: AxiosRequestConfig) {
    return this.instance.patch(url, options, config) as Promise<ServerResult<T>>;
  }

  /**
   * delete请求
   * @param url - 链接
   * @param options - 参数
   */
  delete<T = object>(url: string, options = {}) {
    return this.instance.delete(url, options) as Promise<ServerResult<T>>;
  }

  /**
   * 生成请求的唯一key（考虑参数）
   */
  private generateMapKey(requestConfig: NewAxiosRequestConfig) {
    let url = requestConfig.method || '';
    if (requestConfig.url) url += `^${requestConfig.url}`;
    // 如果存在参数
    if (requestConfig.params) {
      for (const key in requestConfig.params) {
        url += `&${key}=${requestConfig.params[key]}`;
      }
    }
    // 如果存在post数据
    if (
      requestConfig.data &&
      requestConfig.data?.[0] === '{' &&
      requestConfig.data?.[requestConfig.data?.length - 1] === '}'
    ) {
      const obj = JSON.parse(requestConfig.data);
      for (const key in obj) {
        url += `#${key}=${obj[key]}`;
      }
    }
    return url;
  }
}

export default AxiosRequest;
