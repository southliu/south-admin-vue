<script setup lang="ts">
import type { BaseFormData } from '#/form';
import type { Key } from 'ant-design-vue/es/table/interface';
import { useI18n } from 'vue-i18n';
import { computed, onActivated, ref, useTemplateRef } from 'vue';
import { Button, Popconfirm } from 'ant-design-vue';
import {
  batchDeleteMenu,
  createMenu,
  deleteMenu,
  getMenuById,
  getMenuPage,
  updateMenu,
} from '@/servers/system/menu';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseSearch from '@/components/Search/BaseSearch.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import BasePagination from '@/components/Pagination/BasePagination.vue';
import BaseModal from '@/components/Modal/BaseModal.vue';
import BaseForm from '@/components/Form/BaseForm.vue';
import UpdateBtn from '@/components/Buttons/UpdateBtn.vue';
import DeleteBtn from '@/components/Buttons/DeleteBtn.vue';
import { checkPermission } from '@/utils/permissions';
import { ADD_TITLE, EDIT_TITLE, INIT_PAGINATION } from '@/utils/config';
import { message } from '@/utils/message';
import { useCommonStore } from '@/hooks/useCommonStore';
import { searchList, tableColumns, createList } from './model';

defineOptions({ name: 'SystemMenu' });

// 当前行数据
interface RowData {
  id: string;
  label: string;
  type?: number;
}

// 初始化新增数据
const initCreate = {
  type: 2,
  state: 1,
};

const { t } = useI18n();
const createFormRef = useTemplateRef<{ submit: () => void }>('createFormRef');

const isLoading = ref(false);
const isCreateLoading = ref(false);
const isCreateOpen = ref(false);
const createTitle = ref(ADD_TITLE(t));
const createId = ref('');
const createData = ref<BaseFormData>({ ...initCreate });
const createType = ref<number | undefined>(undefined);
const searchData = ref<BaseFormData>({});
const page = ref(INIT_PAGINATION.page);
const pageSize = ref(INIT_PAGINATION.pageSize);
const total = ref(0);
const tableData = ref<BaseFormData[]>([]);
const selectedRowKeys = ref<Key[]>([]);

const { permissions } = useCommonStore();

// 权限前缀
const permissionPrefix = '/authority/menu';

// 权限
const pagePermission = computed(() =>
  checkPermission(permissionPrefix, permissions.value),
);

/** 获取表格数据 */
const getPage = async () => {
  const params = {
    ...searchData.value,
    page: page.value,
    pageSize: pageSize.value,
  };

  try {
    isLoading.value = true;
    const { code, data } = await getMenuPage(params);
    if (Number(code) !== 200) return;
    const { items, total: resultTotal } = data;
    total.value = resultTotal || 0;
    tableData.value = items || [];
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isLoading.value = false;
  }
};

// 每次进入调用（keep-alive 激活）
onActivated(() => {
  if (pagePermission.value.page) getPage();
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

/** 点击新增（传入 record 时为新增下级） */
const onCreate = (record?: RowData) => {
  const id = record?.id;
  let type = record?.id ? record?.type : undefined;
  if (type && type < 3) type = type + 1;
  isCreateOpen.value = true;
  createTitle.value = ADD_TITLE(t);
  createId.value = '';
  createData.value = { ...initCreate, parentId: id, type };
};

/**
 * 点击编辑
 * @param id - 唯一值
 */
const onUpdate = async (id: string) => {
  try {
    isCreateOpen.value = true;
    createTitle.value = EDIT_TITLE(t, id);
    createId.value = id;
    isCreateLoading.value = true;
    const { code, data } = await getMenuById(id);
    if (Number(code) !== 200) return;
    createData.value = data;
    createType.value = data.type as number;
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isCreateLoading.value = false;
  }
};

/** 表格提交 */
const createSubmit = () => {
  createFormRef.value?.submit();
};

/** 关闭新增/修改弹窗 */
const closeCreate = () => {
  isCreateOpen.value = false;
};

/**
 * 新增/编辑提交
 * @param values - 表单返回数据
 */
const handleCreate = async (values: BaseFormData) => {
  try {
    isCreateLoading.value = true;
    const request = () =>
      createId.value ? updateMenu(createId.value, values) : createMenu(values);
    const { code, message: messageInfo } = await request();
    if (Number(code) !== 200) return;
    message.success(messageInfo || t('public.successfulOperation'));
    isCreateOpen.value = false;
    getPage();
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isCreateLoading.value = false;
  }
};

/**
 * 点击删除
 * @param id - 唯一值
 */
const onDelete = async (id: string) => {
  try {
    isLoading.value = true;
    const { code, message: messageInfo } = await deleteMenu(id);
    if (Number(code) === 200) {
      message.success(messageInfo || t('public.successfullyDeleted'));
      getPage();
    }
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isLoading.value = false;
  }
};

/** 处理批量删除 */
const onBatchDelete = async () => {
  try {
    isLoading.value = true;
    const { code, message: messageInfo } = await batchDeleteMenu(
      selectedRowKeys.value as string[],
    );
    if (Number(code) === 200) {
      message.success(messageInfo || t('public.successfullyDeleted'));
      selectedRowKeys.value = [];
      getPage();
    }
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
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

// 表格多选
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Key[]) => {
    selectedRowKeys.value = keys;
  },
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
        :is-create="pagePermission.create"
        :columns="columns"
        :data-source="tableData"
        :row-selection="rowSelection"
        row-key="id"
        :default-expand-all-rows="true"
        :is-operate="true"
        @get-page="getPage"
        @on-create="onCreate"
      >
        <template #leftContent>
          <Popconfirm
            v-if="selectedRowKeys.length > 0 && pagePermission.delete"
            :title="t('public.kindTips')"
            :description="t('public.batchDeleteConfirmMessage', { name: '' })"
            :ok-text="t('public.confirm')"
            :cancel-text="t('public.cancel')"
            @confirm="onBatchDelete"
          >
            <Button danger class="small-btn">
              {{ t('public.batchDelete') }} ({{ selectedRowKeys.length }})
            </Button>
          </Popconfirm>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operate'">
            <div class="flex flex-wrap gap-5px">
              <Button
                v-if="
                  pagePermission.create && ((record as RowData).type ?? 0) <= 2
                "
                type="primary"
                class="small-btn"
                @click="onCreate(record as RowData)"
              >
                {{ t('systems.menu.addChildMenu') }}
              </Button>
              <UpdateBtn
                v-if="pagePermission.update"
                @click="onUpdate((record as RowData).id)"
              />
              <DeleteBtn
                v-if="pagePermission.delete"
                :name="(record as RowData).label"
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

    <BaseModal
      :title="createTitle"
      :open="isCreateOpen"
      :is-loading="isCreateLoading"
      width="600px"
      @ok="createSubmit"
      @cancel="closeCreate"
    >
      <BaseForm
        ref="createFormRef"
        :list="createList(t, createId, createData.type as number)"
        :label-col="{ span: 4 }"
        :data="createData"
        @handle-finish="handleCreate"
      />
    </BaseModal>
  </BaseContent>
</template>
