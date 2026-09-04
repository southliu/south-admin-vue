<script setup lang="ts">
import type { BaseFormData } from '#/form';
import { useI18n } from 'vue-i18n';
import { computed, onActivated, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getArticlePage, deleteArticle } from '@/servers/content/article';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseSearch from '@/components/Search/BaseSearch.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import BasePagination from '@/components/Pagination/BasePagination.vue';
import UpdateBtn from '@/components/Buttons/UpdateBtn.vue';
import DeleteBtn from '@/components/Buttons/DeleteBtn.vue';
import { checkPermission } from '@/utils/permissions';
import { INIT_PAGINATION } from '@/utils/config';
import { message } from '@/utils/message';
import { useCommonStore } from '@/hooks/useCommonStore';
import { usePublicStore } from '@/stores/public';
import { searchList, tableColumns } from './model';

defineOptions({ name: 'ContentArticle' });

// 当前行数据
interface RowData {
  id: string;
  title: string;
}

const { t } = useI18n();
const router = useRouter();
const publicStore = usePublicStore();

const isLoading = ref(false);
const searchData = ref<BaseFormData>({});
const page = ref(INIT_PAGINATION.page);
const pageSize = ref(INIT_PAGINATION.pageSize);
const total = ref(0);
const tableData = ref<BaseFormData[]>([]);

const { permissions } = useCommonStore();

// 权限前缀
const permissionPrefix = '/content/article';

// 权限
const pagePermission = computed(() => checkPermission(permissionPrefix, permissions.value));

/** 获取表格数据 */
const getPage = async () => {
  const params = { ...searchData.value, page: page.value, pageSize: pageSize.value };

  try {
    isLoading.value = true;
    const { code, data } = await getArticlePage(params);
    if (Number(code) === 200) {
      const { items, total: resultTotal } = data;
      total.value = resultTotal;
      tableData.value = items;
    }
  } finally {
    isLoading.value = false;
  }
};

// 首次进入自动加载接口数据
onMounted(() => {
  if (pagePermission.value.page) getPage();
});

// 每次进入时加载数据（keep-alive 激活）
onActivated(() => {
  // 如果正在刷新页面，不需要重复加载
  if (publicStore.isRefreshPage) {
    publicStore.setRefreshPage(false);
    return;
  }
  if (pagePermission.value.page) {
    getPage();
  }
});

// 如果是新增或编辑成功重新加载页面
watch(
  () => publicStore.isRefreshPage,
  (value) => {
    if (value) {
      publicStore.setRefreshPage(false);
      getPage();
    }
  },
);

/**
 * 点击搜索
 * @param values - 表单返回数据
 */
const onSearch = (values: BaseFormData) => {
  page.value = 1;
  searchData.value = values;
  getPage();
};

/** 点击新增 */
const onCreate = () => {
  router.push('/content/article/create');
};

/**
 * 点击编辑
 * @param id - 唯一值
 */
const onUpdate = (id: string) => {
  router.push(`/content/article/update?id=${id}`);
};

/**
 * 点击删除
 * @param id - 唯一值
 */
const onDelete = async (id: string) => {
  try {
    isLoading.value = true;
    const { code, message: messageInfo } = await deleteArticle(id);
    if (Number(code) === 200) {
      message.success(messageInfo || t('public.successfullyDeleted'));
      getPage();
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * 处理分页
 * @param currentPage - 当前页数
 * @param currentPageSize - 每页条数
 */
const onChangePagination = (currentPage: number, currentPageSize: number) => {
  page.value = currentPage;
  pageSize.value = currentPageSize;
  getPage();
};

// 列配置
const columns = computed(() => tableColumns(t));
</script>

<template>
  <BaseContent :is-permission="pagePermission.page">
    <BaseCard>
      <BaseSearch
        :list="searchList(t)"
        :data="searchData"
        :is-loading="isLoading"
        @handle-finish="onSearch"
      />
    </BaseCard>

    <BaseCard class="mt-10px">
      <BaseTable
        :is-loading="isLoading"
        :is-create="pagePermission.create"
        :columns="columns"
        :data-source="tableData"
        @get-page="getPage"
        @on-create="onCreate"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operate'">
            <div class="flex flex-wrap gap-5px">
              <UpdateBtn v-if="pagePermission.update" @click="onUpdate((record as RowData).id)" />
              <DeleteBtn
                v-if="pagePermission.delete"
                :name="(record as RowData).title"
                @handle-delete="onDelete((record as RowData).id)"
              />
            </div>
          </template>
        </template>
      </BaseTable>

      <BasePagination
        :disabled="isLoading"
        :current="page"
        :page-size="pageSize"
        :total="total"
        @change="onChangePagination"
      />
    </BaseCard>
  </BaseContent>
</template>
