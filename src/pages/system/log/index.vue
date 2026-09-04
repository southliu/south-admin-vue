<script setup lang="ts">
import type { BaseFormData } from '#/form';
import type { Key } from 'ant-design-vue/es/table/interface';
import { useI18n } from 'vue-i18n';
import { computed, onActivated, onMounted, ref } from 'vue';
import { batchDeleteLog, deleteLog, getLogPage } from '@/servers/system/log';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseSearch from '@/components/Search/BaseSearch.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import BasePagination from '@/components/Pagination/BasePagination.vue';
import DeleteBtn from '@/components/Buttons/DeleteBtn.vue';
import { checkPermission } from '@/utils/permissions';
import { INIT_PAGINATION } from '@/utils/config';
import { message } from '@/utils/message';
import { useCommonStore } from '@/hooks/useCommonStore';
import { searchList, tableColumns } from './model';

defineOptions({ name: 'SystemLog' });

// 当前行数据
interface RowData {
  id: string;
}

const { t } = useI18n();
const isLoading = ref(false);
const searchData = ref<BaseFormData>({});
const page = ref(INIT_PAGINATION.page);
const pageSize = ref(INIT_PAGINATION.pageSize);
const total = ref(0);
const tableData = ref<BaseFormData[]>([]);
const selectedRowKeys = ref<Key[]>([]);

const { permissions } = useCommonStore();

// 权限前缀
const permissionPrefix = '/authority/log';

// 权限
const pagePermission = computed(() => ({
  page: checkPermission(permissionPrefix, permissions.value).page,
  create: false,
  update: false,
  delete: checkPermission(`${permissionPrefix}/delete`, permissions.value).delete,
}));

/** 获取表格数据 */
const getPage = async () => {
  const params = { ...searchData.value, page: page.value, pageSize: pageSize.value };

  try {
    isLoading.value = true;
    const { code, data } = await getLogPage(params);
    if (Number(code) !== 200) return;
    const { items, total: resultTotal } = data;
    total.value = resultTotal || 0;
    tableData.value = items || [];
  } finally {
    isLoading.value = false;
  }
};

// 首次进入自动加载接口数据
onMounted(() => {
  if (pagePermission.value.page) getPage();
});

// 每次进入调用（keep-alive 激活）
onActivated(() => {
  getPage();
});

/**
 * 点击搜索
 * @param values - 表单返回数据
 */
const onSearch = (values: BaseFormData) => {
  page.value = 1;
  searchData.value = values;
  getPage();
};

/**
 * 点击删除
 * @param id - 唯一值
 */
const onDelete = async (id: string) => {
  try {
    isLoading.value = true;
    const { code, message: messageInfo } = await deleteLog(id);
    if (Number(code) === 200) {
      message.success(messageInfo || t('public.successfullyDeleted'));
      getPage();
    }
  } finally {
    isLoading.value = false;
  }
};

/** 处理批量删除 */
const handleBatchDelete = async () => {
  try {
    if (!selectedRowKeys.value.length) {
      return message.warning({
        content: t('public.tableSelectWarning'),
        key: 'pleaseSelect',
      });
    }
    isLoading.value = true;
    const { code, message: messageInfo } = await batchDeleteLog({ ids: selectedRowKeys.value });
    if (Number(code) === 200) {
      message.success(messageInfo || t('public.successfullyDeleted'));
      selectedRowKeys.value = [];
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

/**
 * 监听表格多选变化
 */
const onSelectChange = (keys: Key[]) => {
  selectedRowKeys.value = keys;
};

// 表格多选
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: onSelectChange,
}));

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
        :columns="columns"
        :data-source="tableData"
        :row-selection="rowSelection"
        @get-page="getPage"
      >
        <template #leftContent>
          <DeleteBtn
            is-icon
            :is-loading="isLoading"
            btn-type="batchDelete"
            @handle-delete="handleBatchDelete"
          />
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operate'">
            <div class="flex flex-wrap gap-5px">
              <DeleteBtn
                v-if="pagePermission.delete"
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
