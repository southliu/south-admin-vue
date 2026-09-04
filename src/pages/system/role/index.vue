<script setup lang="ts">
import type { BaseFormData } from '#/form';
import { useI18n } from 'vue-i18n';
import { computed, onActivated, onMounted, ref, useTemplateRef } from 'vue';
import { Button, Drawer, Spin } from 'ant-design-vue';
import {
  createRole,
  deleteRole,
  getRoleById,
  getRolePage,
  updateRole,
} from '@/servers/system/role';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseSearch from '@/components/Search/BaseSearch.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import BasePagination from '@/components/Pagination/BasePagination.vue';
import BaseForm from '@/components/Form/BaseForm.vue';
import UpdateBtn from '@/components/Buttons/UpdateBtn.vue';
import DeleteBtn from '@/components/Buttons/DeleteBtn.vue';
import { checkPermission } from '@/utils/permissions';
import { ADD_TITLE, EDIT_TITLE, INIT_PAGINATION } from '@/utils/config';
import { message } from '@/utils/message';
import { useCommonStore } from '@/hooks/useCommonStore';
import { searchList, tableColumns, createList } from './model';

defineOptions({ name: 'SystemRole' });

// 当前行数据
interface RowData {
  id: string;
  name: string;
}

const { t } = useI18n();
const createFormRef = useTemplateRef<{ submit: () => void }>('createFormRef');

const isLoading = ref(false);
const isCreateLoading = ref(false);
const isCreateOpen = ref(false);
const createTitle = ref(ADD_TITLE(t));
const createId = ref('');
const createData = ref<BaseFormData>({});
const searchData = ref<BaseFormData>({});
const page = ref(INIT_PAGINATION.page);
const pageSize = ref(INIT_PAGINATION.pageSize);
const total = ref(0);
const tableData = ref<BaseFormData[]>([]);

const { permissions } = useCommonStore();

// 权限前缀
const permissionPrefix = '/authority/role';

// 权限
const pagePermission = computed(() => checkPermission(permissionPrefix, permissions.value));

/** 获取表格数据 */
const getPage = async () => {
  const params = { ...searchData.value, page: page.value, pageSize: pageSize.value };

  try {
    isLoading.value = true;
    const { code, data } = await getRolePage(params);
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

/** 点击新增 */
const onCreate = () => {
  isCreateOpen.value = true;
  createTitle.value = ADD_TITLE(t);
  createId.value = '';
  createData.value = {};
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
    const { code, data } = await getRoleById(id);
    if (Number(code) !== 200) return;
    createData.value = data;
  } finally {
    isCreateLoading.value = false;
  }
};

/**
 * 点击复制
 * @param id - 唯一值
 */
const onCopy = async (id: string) => {
  try {
    isCreateOpen.value = true;
    createTitle.value = ADD_TITLE(t);
    createId.value = '';
    isCreateLoading.value = true;
    const { code, data } = await getRoleById(id);
    if (Number(code) !== 200) return;
    const { id: _id, createdAt, updatedAt, ...rest } = data;
    createData.value = rest;
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
    const request = () => (createId.value ? updateRole(createId.value, values) : createRole(values));
    const { code, message: messageInfo } = await request();
    if (Number(code) !== 200) return;
    message.success(messageInfo || t('public.successfulOperation'));
    isCreateOpen.value = false;
    getPage();
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
    const { code, message: messageInfo } = await deleteRole(id);
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
              <Button
                v-if="pagePermission.create"
                type="primary"
                class="small-btn"
                @click="onCopy((record as RowData).id)"
              >
                {{ t('public.copy') }}
              </Button>
              <DeleteBtn
                v-if="pagePermission.delete"
                :name="(record as RowData).name"
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

    <Drawer
      :title="createTitle"
      :open="isCreateOpen"
      :mask-closable="false"
      width="600px"
      @close="closeCreate"
    >
      <Spin :spinning="isCreateLoading">
        <BaseForm
          ref="createFormRef"
          :list="createList(t, createId)"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 19 }"
          :data="createData"
          @handle-finish="handleCreate"
        />
      </Spin>

      <template #footer>
        <div class="flex justify-end gap-10px">
          <Button @click="closeCreate">{{ t('public.cancel') }}</Button>
          <Button type="primary" @click="createSubmit">{{ t('public.confirm') }}</Button>
        </div>
      </template>
    </Drawer>
  </BaseContent>
</template>
