import type {
  AxiosResponse,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';
import type {
  RequestInterceptors,
  CreateRequestConfig,
  ServerResult,
} from './types';
import axios from 'axios';

interface NewAxiosRequestConfig extends AxiosRequestConfig {
  _mapKey?: string;
  _controller?: AbortController;
  _signalCleanup?: () => void;
}

class AxiosRequest {
  private requestSequence = 0;
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
        const callerSignal = res.signal;
        const abort = () => controller.abort();
        if (callerSignal?.aborted) controller.abort();
        else callerSignal?.addEventListener?.('abort', abort, { once: true });
        (res as NewAxiosRequestConfig)._signalCleanup = () =>
          callerSignal?.removeEventListener?.('abort', abort);
        res.signal = controller.signal;

        const mapKey = this.generateMapKey(res);
        // 保存key到请求配置中，供响应拦截器使用
        (res as NewAxiosRequestConfig)._mapKey = mapKey;
        (res as NewAxiosRequestConfig)._controller = controller;

        // 如果存在则删除该请求
        if (this.abortControllerMap.get(mapKey)) {
          console.warn('取消重复请求：', mapKey);
          this.cancelRequest(mapKey);
        }
        this.abortControllerMap.set(mapKey, controller);

        return res;
      },
      (err: unknown) => Promise.reject(err),
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
      // 因为我们接口的数据都在res.data下，所以我们直接返回res.data
      (res: AxiosResponse) => {
        // 从请求配置中获取之前保存的key
        this.releaseRequest(res.config);
        return res.data;
      },
      (err: unknown) => {
        if (axios.isAxiosError(err)) this.releaseRequest(err.config);
        return Promise.reject(err);
      },
    );
  }

  private releaseRequest(config?: NewAxiosRequestConfig) {
    config?._signalCleanup?.();
    const key = config?._mapKey;
    if (key && this.abortControllerMap.get(key) === config?._controller) {
      this.abortControllerMap.delete(key);
    }
  }
  /** 取消全部请求 */
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
      for (const [key, controller] of this.abortControllerMap) {
        const requestUrl = key.slice(key.indexOf('^') + 1);
        if (
          key === _url ||
          requestUrl === _url ||
          requestUrl.startsWith(`${_url}&`) ||
          requestUrl.startsWith(`${_url}#`)
        ) {
          controller.abort();
          this.abortControllerMap.delete(key);
        }
      }
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
   * @param config - 请求配置，用于设置请求头、超时等选项
   */
  post<T = object>(
    url: string,
    options = {},
    config?: AxiosRequestConfig<object>,
  ) {
    return this.instance.post(url, options, config) as Promise<ServerResult<T>>;
  }
  /**
   * put请求
   * @param url - 链接
   * @param options - 参数
   * @param config - 请求配置，用于设置请求头、超时等选项
   */
  put<T = object>(
    url: string,
    options = {},
    config?: AxiosRequestConfig<object>,
  ) {
    return this.instance.put(url, options, config) as Promise<ServerResult<T>>;
  }
  /**
   * patch请求
   * @param url - 链接
   * @param options - 参数
   * @param config - 请求配置，用于设置请求头、超时等选项
   */
  patch<T = object>(
    url: string,
    options = {},
    config?: AxiosRequestConfig<object>,
  ) {
    return this.instance.patch(url, options, config) as Promise<
      ServerResult<T>
    >;
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
   * @param requestConfig - 请求配置，用于按方法、地址和参数生成唯一标识
   */
  private generateMapKey(requestConfig: NewAxiosRequestConfig) {
    let url = `${requestConfig.method || 'get'}^${requestConfig.url || ''}`;
    if (requestConfig.params) url += `&${JSON.stringify(requestConfig.params)}`;
    const data: unknown = requestConfig.data;
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.getPrototypeOf(data) !== Object.prototype
    ) {
      // 文件等非 JSON 请求不能用空对象序列化结果去重。
      return `${url}#request=${++this.requestSequence}`;
    }
    if (data !== undefined) url += `#${JSON.stringify(data)}`;
    return url;
  }
}

export default AxiosRequest;
