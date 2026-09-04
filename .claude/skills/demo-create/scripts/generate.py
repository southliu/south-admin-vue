#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vue Admin CRUD 代码生成器
根据配置 JSON 生成 api / model / page / option / i18n 文件
用法: python3 .claude/skills/demo-create/scripts/generate.py '<config_json>'
"""

import json
import os
import subprocess
import sys


class CodeGenerator:
    def __init__(self, config):
        self.config = config
        self.module_name = config.get("module_name", "Demo")
        self.api_path = config.get("api_path", "/demo")
        self.permission_prefix = config.get("permission_prefix", "/demo")
        self.page_mode = config.get("page_mode", "modal")
        self.enable_i18n = bool(config.get("enable_i18n", False))
        self.father_path = config.get("father_path", self.api_path)
        self.zh_title = config.get("zh_title", "")
        self.en_title = config.get("en_title", "")
        self.project_root = config.get("project_root", os.getcwd())
        self.fields = config.get("fields", [])

        # 模块路径（/system/product -> system/product）
        self.module_path = self.api_path.strip("/").rstrip("/") if self.api_path.strip("/") else "demo"
        # 路由 PascalCase 名称（keep-alive 缓存名）
        self.component_name = "".join(
            part.capitalize() for part in self.module_path.split("/") if part
        )

    # ------------------------------------------------------------------
    # 文件路径
    # ------------------------------------------------------------------
    def api_file(self):
        return os.path.join(self.project_root, f"src/servers/{self.module_path}.ts")

    def model_file(self):
        return os.path.join(self.project_root, f"src/pages/{self.module_path}/model.ts")

    def page_file(self):
        return os.path.join(self.project_root, f"src/pages/{self.module_path}/index.vue")

    def option_file(self):
        return os.path.join(self.project_root, f"src/pages/{self.module_path}/[option].vue")

    def zh_locale_file(self):
        return os.path.join(self.project_root, f"src/locales/zh/{self.module_name.lower()}.ts")

    def en_locale_file(self):
        return os.path.join(self.project_root, f"src/locales/en/{self.module_name.lower()}.ts")

    # ------------------------------------------------------------------
    # 标签处理
    # ------------------------------------------------------------------
    def label(self, field, prefix="moduleName"):
        """生成字段标签（i18n 或中文）"""
        if self.enable_i18n:
            return f"t('{prefix}.{field['dataIndex']}')"
        return f"'{field['label_zh']}'"

    # ------------------------------------------------------------------
    # 模板生成
    # ------------------------------------------------------------------
    def generate_api(self):
        xxx = self.module_name
        return f"""import type {{ BaseFormData }} from '#/form';
import type {{ PageServerResult, PaginationData }} from '#/public';
import {{ request }} from '@/servers';

enum API {{
  URL = '{self.api_path}',
}}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function get{xxx}Page(data: Partial<BaseFormData> & PaginationData) {{
  return request.get<PageServerResult<BaseFormData[]>>(`${{API.URL}}/page`, {{ params: data }});
}}

/**
 * 根据ID获取数据
 * @param id - ID
 */
export function get{xxx}ById(id: string) {{
  return request.get<BaseFormData>(`${{API.URL}}/detail?id=${{id}}`);
}}

/**
 * 新增数据
 * @param data - 请求数据
 */
export function create{xxx}(data: BaseFormData) {{
  return request.post(`${{API.URL}}/create`, data);
}}

/**
 * 修改数据
 * @param id - 修改id值
 * @param data - 请求数据
 */
export function update{xxx}(id: string, data: BaseFormData) {{
  return request.put(`${{API.URL}}/update/${{id}}`, data);
}}

/**
 * 删除
 * @param id - 删除id值
 */
export function delete{xxx}(id: string) {{
  return request.delete(`${{API.URL}}/${{id}}`);
}}

/**
 * 批量删除
 * @param data - 请求数据
 */
export function batchDelete{xxx}(data: BaseFormData) {{
  return request.post(`${{API.URL}}/batchDelete`, data);
}}
"""

    def generate_model(self):
        xxx = self.module_name
        search_fields = [f for f in self.fields if f.get("search")]
        table_fields = [f for f in self.fields if f.get("table")]
        form_fields = [f for f in self.fields if f.get("form")]

        # searchList
        search_items = []
        for f in search_fields:
            search_items.append(
                f"""  {{
    label: {self.label(f)},
    name: '{f['dataIndex']}',
    wrapperWidth: 200,
    component: '{f.get('component', 'Input')}',
  }},"""
            )
        search_body = "\n".join(search_items) if search_items else "  // 暂无搜索项"

        # tableColumns
        table_items = [
            """  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    fixed: 'left',
  },"""
        ]
        for f in table_fields:
            table_items.append(
                f"""  {{
    title: {self.label(f)},
    dataIndex: '{f['dataIndex']}',
    width: {f.get('width', 200)},
  }},"""
            )
        table_items.append(
            """  {
    title: t('public.operate'),
    dataIndex: 'operate',
    width: 200,
    fixed: 'right',
  },"""
        )
        table_body = "\n".join(table_items)

        # createList
        form_items = []
        for f in form_fields:
            rules = "rules: FORM_REQUIRED," if f.get("required") else ""
            form_items.append(
                f"""  {{
    label: {self.label(f)},
    name: '{f['dataIndex']}',
    {rules}
    component: '{f.get('component', 'Input')}',
  }},"""
            )
        form_body = "\n".join(form_items) if form_items else "  // 暂无表单项"

        return f"""import type {{ BaseFormList, BaseSearchList }} from '#/form';
import type {{ TableColumn }} from '#/public';
import type {{ Translate }} from '@/utils/config';
import {{ FORM_REQUIRED }} from '@/utils/config';

// 搜索数据
export const searchList = (t: Translate): BaseSearchList[] => [
{search_body}
];

/**
 * 表格数据
 */
export const tableColumns = (t: Translate): TableColumn[] => {{
  return [
{table_body}
  ];
}};

/**
 * 新增数据
 */
export const createList = (t: Translate): BaseFormList[] => [
{form_body}
];
"""

    def generate_page(self):
        xxx = self.module_name
        module_lower = self.module_name.lower()
        i18n_prefix = module_lower

        # RowData 接口
        row_fields = "\n".join(
            f"  {f['dataIndex']}: {self.field_ts_type(f)};" for f in self.fields if f.get("table")
        )

        # page 模式下的操作列跳转 / modal 模式弹窗
        is_page_mode = self.page_mode == "page"

        if is_page_mode:
            operate_js = f"""/** 点击新增 */
const onCreate = () => {{
  router.push('{self.father_path}/create');
}};

/**
 * 点击编辑
 * @param id - 唯一值
 */
const onUpdate = (id: string) => {{
  router.push(`{self.father_path}/update?id=${{id}}`);
}};"""
        else:
            operate_js = f"""/** 点击新增 */
const onCreate = () => {{
  isCreateOpen.value = true;
  createTitle.value = ADD_TITLE(t);
  createId.value = '';
  createData.value = {{ ...initCreate }};
}};

/**
 * 点击编辑
 * @param id - 唯一值
 */
const onUpdate = async (id: string) => {{
  try {{
    isCreateOpen.value = true;
    createTitle.value = EDIT_TITLE(t, id);
    createId.value = id;
    isCreateLoading.value = true;
    const {{ code, data }} = await get{xxx}ById(id);
    if (Number(code) !== 200) return;
    createData.value = data;
  }} finally {{
    isCreateLoading.value = false;
  }}
}};

/** 表格提交 */
const createSubmit = () => {{
  createFormRef.value?.submit();
}};

/** 关闭新增/修改弹窗 */
const closeCreate = () => {{
  isCreateOpen.value = false;
}};

/**
 * 新增/编辑提交
 * @param values - 表单返回数据
 */
const handleCreate = async (values: BaseFormData) => {{
  try {{
    isCreateLoading.value = true;
    const request = () => (createId.value ? update{xxx}(createId.value, values) : create{xxx}(values));
    const {{ code, message: messageInfo }} = await request();
    if (Number(code) !== 200) return;
    message.success(messageInfo || t('public.successfulOperation'));
    isCreateOpen.value = false;
    getPage();
  }} finally {{
    isCreateLoading.value = false;
  }}
}};"""

        modal_template = """
    <BaseModal
      :title="createTitle"
      :open="isCreateOpen"
      :is-loading="isCreateLoading"
      @ok="createSubmit"
      @cancel="closeCreate"
    >
      <BaseForm
        ref="createFormRef"
        :list="createList(t)"
        :label-col="{ span: 4 }"
        :data="createData"
        @handle-finish="handleCreate"
      />
    </BaseModal>""" if not is_page_mode else ""

        extra_state = (
            ""
            if not is_page_mode
            else """
const isCreateLoading = ref(false);
const isCreateOpen = ref(false);
const createTitle = ref(ADD_TITLE(t));
const createId = ref('');
const createData = ref<BaseFormData>({ ...initCreate });
const createFormRef = useTemplateRef<{ submit: () => void }>('createFormRef');"""
        )

        extra_imports = (
            ""
            if is_page_mode
            else """
import BaseModal from '@/components/Modal/BaseModal.vue';
import BaseForm from '@/components/Form/BaseForm.vue';"""
        )

        # i18n 调用
        search_call = "searchList(t)"
        columns_call = "tableColumns(t)"

        return f"""<script setup lang="ts">
import type {{ BaseFormData }} from '#/form';
import type {{ Key }} from 'ant-design-vue/es/table/interface';
import {{ useI18n }} from 'vue-i18n';
import {{ computed, onActivated, onMounted, ref, useTemplateRef }} from 'vue';
import {{ useRouter }} from 'vue-router';
import {{
  batchDelete{xxx},
  create{xxx},
  delete{xxx},
  get{xxx}ById,
  get{xxx}Page,
  update{xxx},
}} from '@/servers/{self.module_path}';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseSearch from '@/components/Search/BaseSearch.vue';
import BaseTable from '@/components/Table/BaseTable.vue';
import BasePagination from '@/components/Pagination/BasePagination.vue';
import UpdateBtn from '@/components/Buttons/UpdateBtn.vue';
import DeleteBtn from '@/components/Buttons/DeleteBtn.vue';{extra_imports}
import {{ checkPermission }} from '@/utils/permissions';
import {{ ADD_TITLE, EDIT_TITLE, INIT_PAGINATION }} from '@/utils/config';
import {{ message }} from '@/utils/message';
import {{ useCommonStore }} from '@/hooks/useCommonStore';
import {{ searchList, tableColumns, createList }} from './model';

defineOptions({{ name: '{self.component_name}' }});

// 当前行数据
interface RowData {{
  id: string;
{row_fields}
}}

// 初始化新增数据
const initCreate = {{
  status: 1,
}};

const {{ t }} = useI18n();
const router = useRouter();
{extra_state}

const isLoading = ref(false);
const searchData = ref<BaseFormData>({{}});
const page = ref(INIT_PAGINATION.page);
const pageSize = ref(INIT_PAGINATION.pageSize);
const total = ref(0);
const tableData = ref<BaseFormData[]>([]);
const selectedRowKeys = ref<Key[]>([]);

const {{ permissions }} = useCommonStore();

// 权限前缀
const permissionPrefix = '{self.permission_prefix}';

// 权限
const pagePermission = computed(() => checkPermission(permissionPrefix, permissions.value));

/** 获取表格数据 */
const getPage = async () => {{
  const params = {{ ...searchData.value, page: page.value, pageSize: pageSize.value }};

  try {{
    isLoading.value = true;
    const {{ code, data }} = await get{xxx}Page(params);
    if (Number(code) !== 200) return;
    const {{ items, total: resultTotal }} = data;
    total.value = resultTotal || 0;
    tableData.value = items || [];
  }} finally {{
    isLoading.value = false;
  }}
}};

// 首次进入自动加载接口数据
onMounted(() => {{
  if (pagePermission.value.page) getPage();
}});

// 每次进入调用（keep-alive 激活）
onActivated(() => {{
  getPage();
}});

/**
 * 点击搜索
 * @param values - 表单返回数据
 */
const onSearch = (values: BaseFormData) => {{
  page.value = 1;
  searchData.value = values;
  getPage();
}};
{operate_js}

/**
 * 点击删除
 * @param id - 唯一值
 */
const onDelete = async (id: string) => {{
  try {{
    isLoading.value = true;
    const {{ code, message: messageInfo }} = await delete{xxx}(id);
    if (Number(code) === 200) {{
      message.success(messageInfo || t('public.successfullyDeleted'));
      getPage();
    }}
  }} finally {{
    isLoading.value = false;
  }}
}};

/** 处理批量删除 */
const handleBatchDelete = async () => {{
  try {{
    if (!selectedRowKeys.value.length) {{
      return message.warning({{
        content: t('public.tableSelectWarning'),
        key: 'pleaseSelect',
      }});
    }}
    isLoading.value = true;
    const {{ code, message: messageInfo }} = await batchDelete{xxx}({{ ids: selectedRowKeys.value }});
    if (Number(code) === 200) {{
      message.success(messageInfo || t('public.successfullyDeleted'));
      getPage();
    }}
  }} finally {{
    isLoading.value = false;
  }}
}};

/**
 * 处理分页
 * @param currentPage - 当前页数
 * @param currentPageSize - 每页条数
 */
const onChangePagination = (currentPage: number, currentPageSize: number) => {{
  page.value = currentPage;
  pageSize.value = currentPageSize;
  getPage();
}};

/**
 * 监听表格多选变化
 */
const onSelectChange = (keys: Key[]) => {{
  selectedRowKeys.value = keys;
}};

// 表格多选
const rowSelection = computed(() => ({{
  selectedRowKeys: selectedRowKeys.value,
  onChange: onSelectChange,
}}));

// 列配置
const columns = computed(() => {columns_call});
</script>

<template>
  <BaseContent :is-permission="pagePermission.page">
    <BaseCard>
      <BaseSearch
        :list="{search_call}"
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
        @get-page="getPage"
        @on-create="onCreate"
      >
        <template #leftContent>
          <DeleteBtn
            is-icon
            :is-loading="isLoading"
            btn-type="batchDelete"
            @handle-delete="handleBatchDelete"
          />
        </template>

        <template #bodyCell="{{ column, record }}">
          <template v-if="column.dataIndex === 'operate'">
            <div class="flex flex-wrap gap-5px">
              <UpdateBtn v-if="pagePermission.update" @click="onUpdate((record as RowData).id)" />
              <DeleteBtn
                v-if="pagePermission.delete"
                :name="String((record as RowData).id)"
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
    </BaseCard>{modal_template}
  </BaseContent>
</template>
"""

    @staticmethod
    def field_ts_type(field):
        component = field.get("component", "Input")
        if component == "InputNumber":
            return "number"
        if component == "Switch":
            return "boolean"
        return "string"

    def generate_option(self):
        xxx = self.module_name
        return f"""<script setup lang="ts">
import type {{ BaseFormData }} from '#/form';
import {{ Spin }} from 'ant-design-vue';
import {{ useI18n }} from 'vue-i18n';
import {{ computed, onActivated, onMounted, ref, useTemplateRef }} from 'vue';
import {{ useRoute, useRouter }} from 'vue-router';
import {{ get{xxx}ById, create{xxx}, update{xxx} }} from '@/servers/{self.module_path}';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseForm from '@/components/Form/BaseForm.vue';
import SubmitBottom from '@/components/Bottom/SubmitBottom.vue';
import {{ checkPermission }} from '@/utils/permissions';
import {{ message }} from '@/utils/message';
import {{ useCommonStore }} from '@/hooks/useCommonStore';
import {{ useSingleTab }} from '@/hooks/useSingleTab';
import {{ usePublicStore }} from '@/stores/public';
import {{ useTabsStore }} from '@/stores/tabs';
import {{ createList }} from './model';

defineOptions({{ name: '{self.component_name}Option' }});

// 初始化新增数据
const initCreate = {{
  status: 1,
}};

// 父路径
const fatherPath = '{self.father_path}';

const {{ t }} = useI18n();
const route = useRoute();
const router = useRouter();
const createFormRef = useTemplateRef<{{
  submit: () => void;
  resetFields: () => void;
}}>('createFormRef');
const publicStore = usePublicStore();
const tabsStore = useTabsStore();

const id = (route.query.id as string) || '';
const currentId = ref(id);
const isLoading = ref(false);
const createId = ref('');
const createData = ref<BaseFormData>({{ ...initCreate }});

const {{ permissions }} = useCommonStore();

// 单标签管理
useSingleTab({{
  fatherPath,
  zhTitle: id ? '编辑{self.zh_title or self.module_name}' : '新增{self.zh_title or self.module_name}',
  enTitle: id ? 'Edit {self.en_title or self.module_name}' : 'Add {self.en_title or self.module_name}',
}});

// 权限前缀
const permissionPrefix = '{self.permission_prefix}';

// 权限
const pagePermission = computed(() => {{
  const result = checkPermission(permissionPrefix, permissions.value);
  return {{
    create: result.create,
    update: result.update,
  }};
}});

/** 处理新增 */
const handleCreate = () => {{
  createId.value = '';
  createData.value = {{ ...initCreate }};
}};

/**
 * 处理编辑
 * @param id - 唯一值
 */
const handleUpdate = async (id: string) => {{
  try {{
    createId.value = id;
    isLoading.value = true;
    const {{ code, data }} = await get{xxx}ById(id);
    if (Number(code) !== 200) return;
    createData.value = data;
  }} finally {{
    isLoading.value = false;
  }}
}};

onMounted(() => {{
  if (id) {{
    handleUpdate(id);
  }} else {{
    handleCreate();
  }}
}});

// 页面激活时检测url参数变化（新增/编辑切换）
onActivated(() => {{
  const newId = (route.query.id as string) || '';

  if (currentId.value !== newId) {{
    if (newId) {{
      handleUpdate(newId);
    }} else {{
      handleCreate();
    }}
    currentId.value = newId;
  }}
}});

/** 表格提交 */
const handleSubmit = () => {{
  createFormRef.value?.submit();
}};

/**
 * 返回主页
 * @param isRefresh - 返回页面是否重新加载接口
 */
const goBack = (isRefresh?: boolean) => {{
  createFormRef.value?.resetFields();
  if (isRefresh) publicStore.setRefreshPage(true);
  tabsStore.closeTabGoNext({{
    key: route.path + (route.fullPath.replace(route.path, '') || ''),
    nextPath: fatherPath,
  }});
  router.push(fatherPath);
}};

/**
 * 新增/编辑提交
 * @param values - 表单返回数据
 */
const handleFinish = async (values: BaseFormData) => {{
  try {{
    isLoading.value = true;
    const request = () => (createId.value ? update{xxx}(createId.value, values) : create{xxx}(values));
    const {{ code, message: messageInfo }} = await request();
    if (Number(code) !== 200) return;
    message.success(messageInfo || t('public.successfulOperation'));
    createFormRef.value?.resetFields();
    goBack(true);
  }} finally {{
    isLoading.value = false;
  }}
}};
</script>

<template>
  <BaseContent :is-permission="id ? pagePermission.update : pagePermission.create">
    <div class="!h-[calc(100vh-98px)]">
      <BaseCard>
        <div class="mt-20px mb-50px">
          <Spin :spinning="isLoading">
            <BaseForm
              ref="createFormRef"
              :list="createList(t)"
              :data="createData"
              :label-col="{{ span: 5 }}"
              @handle-finish="handleFinish"
            />
          </Spin>
        </div>

        <SubmitBottom :is-loading="isLoading" :back-path="fatherPath" @handle-confirm="handleSubmit" />
      </BaseCard>
    </div>
  </BaseContent>
</template>
"""

    def generate_locale(self, lang):
        items = []
        for f in self.fields:
            label = f.get("label_zh") if lang == "zh" else f.get("label_en")
            items.append(f"  {f['dataIndex']}: '{label}',")
        body = "\n".join(items)
        return f"export default {{\n{body}\n}};\n"

    # ------------------------------------------------------------------
    # 写入文件
    # ------------------------------------------------------------------
    def write_file(self, path, content):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8", newline="\n") as fp:
            fp.write(content)
        print(f"生成: {os.path.relpath(path, self.project_root)}")

    def format_with_prettier(self, paths):
        """运行 prettier 格式化生成的文件"""
        try:
            cmd = ["npx", "prettier", "--write"] + paths
            subprocess.run(cmd, cwd=self.project_root, capture_output=True, timeout=60)
            print("prettier 格式化完成")
        except Exception as e:  # noqa: BLE001
            print(f"prettier 格式化失败（不影响生成）: {e}")

    def run(self):
        generated = []

        # 1. API 文件
        api_path = self.api_file()
        self.write_file(api_path, self.generate_api())
        generated.append(api_path)

        # 2. Model 文件
        model_path = self.model_file()
        self.write_file(model_path, self.generate_model())
        generated.append(model_path)

        # 3. Page 文件
        page_path = self.page_file()
        self.write_file(page_path, self.generate_page())
        generated.append(page_path)

        # 4. Option 文件（仅 page 模式）
        if self.page_mode == "page":
            option_path = self.option_file()
            self.write_file(option_path, self.generate_option())
            generated.append(option_path)

        # 5/6. 国际化文件
        if self.enable_i18n:
            zh_path = self.zh_locale_file()
            self.write_file(zh_path, self.generate_locale("zh"))
            generated.append(zh_path)

            en_path = self.en_locale_file()
            self.write_file(en_path, self.generate_locale("en"))
            generated.append(en_path)

        # prettier 格式化
        self.format_with_prettier(generated)

        print("\n生成完成！共生成文件:")
        for path in generated:
            print(f"  - {os.path.relpath(path, self.project_root)}")


def main():
    if len(sys.argv) < 2:
        print("用法: python3 generate.py '<config_json>'")
        print("配置示例参见: config.example.json")
        sys.exit(1)

    try:
        config = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(f"配置 JSON 解析失败: {e}")
        sys.exit(1)

    generator = CodeGenerator(config)
    generator.run()


if __name__ == "__main__":
    main()
