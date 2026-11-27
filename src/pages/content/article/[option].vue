<script setup lang="ts">
import type { BaseFormData } from '#/form';
import { Spin } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { computed, onActivated, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getArticleById,
  createArticle,
  updateArticle,
} from '@/servers/content/article';
import BaseCard from '@/components/Card/BaseCard.vue';
import BaseContent from '@/components/Content/BaseContent.vue';
import BaseForm from '@/components/Form/BaseForm.vue';
import SubmitBottom from '@/components/Bottom/SubmitBottom.vue';
import { checkPermission } from '@/utils/permissions';
import { message } from '@/utils/message';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useSingleTab } from '@/hooks/useSingleTab';
import { usePublicStore } from '@/stores/public';
import { useTabsStore } from '@/stores/tabs';
import { createList } from './model';

defineOptions({ name: 'ContentArticleOption' });

// 初始化新增数据
const initCreate = {
  content: '<h4>初始化内容</h4>',
};

// 父路径
const fatherPath = '/content/article';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const createFormRef = useTemplateRef<{
  submit: () => void;
  resetFields: () => void;
}>('createFormRef');
const publicStore = usePublicStore();
const tabsStore = useTabsStore();

const id = (route.query.id as string) || '';
const currentId = ref(id);
const isLoading = ref(false);
const createId = ref('');
const createData = ref<BaseFormData>({ ...initCreate });

const { permissions } = useCommonStore();

// 单标签管理
useSingleTab({
  fatherPath,
  zhTitle: id ? '编辑文章管理' : '新增文章管理',
  enTitle: id ? 'Edit Article Management' : 'Add Article Management',
});

// 权限前缀
const permissionPrefix = '/content/article';

// 权限
const pagePermission = computed(() => {
  const result = checkPermission(permissionPrefix, permissions.value);
  return {
    create: result.create,
    update: result.update,
  };
});

/** 处理新增 */
const handleCreate = () => {
  createId.value = '';
  createData.value = { ...initCreate };
};

/**
 * 处理编辑
 * @param id - 唯一值
 */
const handleUpdate = async (id: string) => {
  try {
    createId.value = id;
    isLoading.value = true;
    const { code, data } = await getArticleById(id);
    if (Number(code) !== 200) return;
    createData.value = data;
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (id) {
    handleUpdate(id);
  } else {
    handleCreate();
  }
});

// 页面激活时检测url参数变化（新增/编辑切换）
onActivated(() => {
  const newId = (route.query.id as string) || '';

  if (currentId.value !== newId) {
    if (newId) {
      handleUpdate(newId);
    } else {
      handleCreate();
    }
    currentId.value = newId;
  }
});

/** 表格提交 */
const handleSubmit = () => {
  createFormRef.value?.submit();
};

/**
 * 返回主页
 * @param isRefresh - 返回页面是否重新加载接口
 */
const goBack = (isRefresh?: boolean) => {
  createFormRef.value?.resetFields();
  if (isRefresh) publicStore.setRefreshPage(true);
  tabsStore.closeTabGoNext({
    key: route.path + (route.fullPath.replace(route.path, '') || ''),
    nextPath: fatherPath,
  });
  router.push(fatherPath);
};

/**
 * 新增/编辑提交
 * @param values - 表单返回数据
 */
const handleFinish = async (values: BaseFormData) => {
  try {
    isLoading.value = true;
    const request = () =>
      createId.value
        ? updateArticle(createId.value, values)
        : createArticle(values);
    const { code, message: messageInfo } = await request();
    if (Number(code) !== 200) return;
    message.success(messageInfo || t('public.successfulOperation'));
    createFormRef.value?.resetFields();
    goBack(true);
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseContent
    :is-permission="id ? pagePermission.update : pagePermission.create"
  >
    <div class="!h-[calc(100vh-98px)]">
      <BaseCard>
        <div class="mt-20px mb-50px">
          <Spin :spinning="isLoading">
            <BaseForm
              ref="createFormRef"
              :list="createList(t)"
              :data="createData"
              :label-col="{ span: 5 }"
              @handle-finish="handleFinish"
            />
          </Spin>
        </div>
      </BaseCard>
    </div>

    <SubmitBottom
      :is-loading="isLoading"
      :back-path="fatherPath"
      @handle-confirm="handleSubmit"
    />
  </BaseContent>
</template>
