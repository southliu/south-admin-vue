import type { BaseFormData } from '#/form';
import { watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTabsStore } from '@/stores/tabs';

/**
 * 将搜索参数带入url中
 * @param formRef - 搜索表单组件实例（暴露 setFieldsValue）
 */
export function useSearchUrlParams(formRef: {
  value?: { setFieldsValue?: (values: Record<string, unknown>) => void } | null;
}) {
  const route = useRoute();
  const router = useRouter();
  const tabsStore = useTabsStore();

  /** url参数带入搜索表单中 */
  const handleSetSearchForm = () => {
    const { __app_version: _version, ...urlParams } = route.query;
    formRef.value?.setFieldsValue?.(urlParams);
  };

  watchEffect(() => {
    handleSetSearchForm();
  });

  /**
   * 将搜索参数带入url中
   * @param values - 搜索数据
   */
  const handleSetSearchParams = (values: BaseFormData) => {
    // 去除值为 undefined 的属性
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined),
    ) as Record<string, string>;

    // 将对象转换为 url 参数字符串
    let urlParams = new URLSearchParams(filteredValues).toString();
    if (urlParams?.length) {
      urlParams = `?${urlParams}`;
    }

    router.replace({
      query: {
        ...filteredValues,
        ...(route.query.__app_version
          ? { __app_version: route.query.__app_version }
          : {}),
      },
    });
    tabsStore.setTabs(route.path, urlParams);
  };

  return { handleSetSearchParams };
}
