<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import { Form } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { reactive, ref, useTemplateRef } from 'vue';
import { updatePassword } from '@/servers/login';
import { message } from '@/utils/message';
import { PASSWORD_RULE } from '@/utils/config';
import { useLogout } from '@/hooks/useLogout';
import BaseModal from '@/components/Modal/BaseModal.vue';
import PasswordStrength from '@/components/PasswordStrength/index.vue';

defineOptions({ name: 'UpdatePassword' });

const { t } = useI18n();
const { handleLogout } = useLogout();
const formRef = useTemplateRef<FormInstance>('formRef');
const isOpen = ref(false);
const isLoading = ref(false);

const formState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

/** 打开弹窗 */
const open = () => {
  isOpen.value = true;
};

/** 点击模态框确定（requestSubmit 触发校验与提交流程） */
const onOk = () => {
  const el = formRef.value?.$el as HTMLFormElement | undefined;
  el?.requestSubmit?.();
};

/** 关闭模态框 */
const onClose = () => {
  isOpen.value = false;
  formRef.value?.resetFields();
};

/**
 * 提交表单
 * @param values - 表单值
 */
const onFinish = async (values: Record<string, unknown>) => {
  // 当密码和确认密码不同时则提示错误
  if (values.newPassword !== values.confirmPassword) {
    return message.warning({
      content: t('login.confirmPasswordMessage'),
      key: 'confirmPassword',
    });
  }
  try {
    isLoading.value = true;
    const { code, message: messageInfo } = await updatePassword(values);
    if (Number(code) === 200) {
      onClose();
      message.success(messageInfo);
      handleLogout();
    }
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
  } finally {
    isLoading.value = false;
  }
};

defineExpose({ open });
</script>

<template>
  <BaseModal
    :title="t('public.changePassword')"
    :open="isOpen"
    :is-loading="isLoading"
    @ok="onOk"
    @cancel="onClose"
  >
    <Form
      ref="formRef"
      :model="formState"
      label-wrap
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
      @finish="onFinish"
      autocomplete="off"
    >
      <Form.Item
        :label="t('login.oldPassword')"
        name="oldPassword"
        :rules="[
          {
            required: true,
            message: t('public.pleaseEnter', { name: t('login.password') }),
          },
          PASSWORD_RULE(t),
        ]"
      >
        <PasswordStrength v-model:value="formState.oldPassword" />
      </Form.Item>

      <Form.Item
        :label="t('login.newPassword')"
        name="newPassword"
        :rules="[
          {
            required: true,
            message: t('public.pleaseEnter', { name: t('login.password') }),
          },
          PASSWORD_RULE(t),
        ]"
      >
        <PasswordStrength v-model:value="formState.newPassword" />
      </Form.Item>

      <Form.Item
        :label="t('login.confirmPassword')"
        name="confirmPassword"
        :rules="[
          {
            required: true,
            message: t('public.pleaseEnter', {
              name: t('login.confirmPassword'),
            }),
          },
          PASSWORD_RULE(t),
        ]"
      >
        <PasswordStrength v-model:value="formState.confirmPassword" />
      </Form.Item>
    </Form>
  </BaseModal>
</template>
