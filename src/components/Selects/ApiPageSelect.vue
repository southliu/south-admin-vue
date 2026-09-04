<script setup lang="ts">
import type { ApiPageSelectProps } from './types';
import type { DefaultOptionType } from 'ant-design-vue/es/select';
import { Select, Spin } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { MAX_TAG_COUNT } from './index';

defineOptions({ name: 'ApiPageSelect' });

const props = defineProps<ApiPageSelectProps>();

const {
  pageKey = 'page',
  pageSizeKey = 'pageSize',
  queryKey = 'query',
  page = 1,
  pageSize = 20,
} = props;

const { t } = useI18n();
const isLoading = ref(false);
const currentPage = ref(page);
const options = ref<DefaultOptionType[]>([]);
const searchValue = ref('');
const hasMore = ref(true);

/** 获取接口数据 */
const getApiData = async () => {
  if (!props.api || !hasMore.value) return;
  try {
    const { api, params, apiResultKey } = props;

    const apiPageFun = {
      [pageKey]: currentPage.value,
      [pageSizeKey]: pageSize,
      [queryKey]: searchValue.value || undefined,
    };

    let apiFun;
    if (Array.isArray(params)) {
      const newParams = params.map((item) =>
        item?.constructor === Object ? { ...item, ...apiPageFun } : item,
      );
      apiFun = api(...newParams);
    } else {
      apiFun = api({ ...params, ...apiPageFun });
    }

    isLoading.value = true;
    const { code, data } = await apiFun;
    if (Number(code) !== 200) return;
    const result = (
      apiResultKey ? (data as Record<string, unknown>)?.[apiResultKey] : data
    ) as DefaultOptionType[];

    if (result?.length) {
      options.value = options.value.concat(result);
    }
    hasMore.value = !!result?.length;

    // 如果不存在更多数据，尾部显示没有更多数据
    if (!hasMore.value && options.value.length) {
      options.value = options.value.concat([
        {
          [props?.fieldNames?.label || 'label']: t('public.noMoreData'),
          [props?.fieldNames?.value || 'value']: t('public.noMoreData'),
          disabled: true,
          className: 'text-center',
        } as DefaultOptionType,
      ]);
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // 当有值且列表为空时，自动获取接口
  if (props.value !== undefined && props.value !== null && options.value.length === 0) {
    getApiData();
  }
});

/**
 * 展开下拉回调
 * @param open - 是否展开
 */
const onOpenChange = (open: boolean) => {
  if (open && !options.value?.length) getApiData();
};

/** 滚动事件处理 */
const handleScroll = (e: UIEvent) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget as HTMLElement;
  const threshold = 10; // 距离底部阈值

  // 触底判断
  if (scrollTop + clientHeight >= scrollHeight - threshold && !isLoading.value && hasMore.value) {
    currentPage.value += 1;
    getApiData();
  }
};

/** 初始化 */
const handleInit = () => {
  options.value = [];
  currentPage.value = page;
  hasMore.value = true;
};

/** 处理搜索 */
const handleSearch = useDebounceFn((value: string) => {
  handleInit();
  searchValue.value = value;
  getApiData();
}, 300);
</script>

<template>
  <Select
    allow-clear
    show-search
    :filter-option="false"
    :max-tag-count="MAX_TAG_COUNT"
    :placeholder="t('public.inputPleaseSelect')"
    v-bind="$attrs"
    :loading="isLoading"
    :options="options"
    @open-change="onOpenChange"
    @popup-scroll="handleScroll"
    @search="handleSearch"
  >
    <template #notFoundContent>
      <div v-if="isLoading" class="py-3px text-center">
        <Spin size="small" />
      </div>
    </template>
  </Select>
</template>
