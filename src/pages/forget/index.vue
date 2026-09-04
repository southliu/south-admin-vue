<script setup lang="ts">
import { Button, Form, Input, InputNumber } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import I18n from '@/components/I18n/index.vue';
import Theme from '@/components/Theme/index.vue';
import { setTitle } from '@/utils/helper';
import { forgetPassword } from '@/servers/login';
import { message } from '@/utils/message';
import { PASSWORD_RULE, THEME_KEY } from '@/utils/config';
import { usePublicStore } from '@/stores/public';
import Logo from '@/assets/images/logo.svg';

defineOptions({ name: 'Forget' });

interface ForgetData {
  username: string;
  newPassword: string;
  confirmPassword: string;
  phone: number | string;
  verification: number | string;
}

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const publicStore = usePublicStore();

const isLoading = ref(false);
const verificationTime = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;
const themeCache = (localStorage.getItem(THEME_KEY) || 'light') as 'dark' | 'light';

const formState = reactive<ForgetData>({
  username: '',
  newPassword: '',
  confirmPassword: '',
  phone: '',
  verification: '',
});

// 主题初始化
if (themeCache === 'dark') {
  document.body.className = 'theme-dark';
}
publicStore.setThemeValue(themeCache === 'dark' ? 'dark' : 'light');

// 语言切换修改title
watch(
  locale,
  () => {
    setTitle(t, t('login.resetPassword'));
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

/**
 * 修改密码
 * @param values - 表单数据
 */
const handleFinish = async (values: ForgetData) => {
  // 当密码和确认密码不同时则提示错误
  if (values.newPassword !== values.confirmPassword) {
    return message.warning({
      content: t('login.confirmPasswordMessage'),
      key: 'confirmPassword',
    });
  }

  try {
    isLoading.value = true;
    const { code } = await forgetPassword(values);
    if (Number(code) !== 200) return;

    message.success({
      content: t('login.verificationPassed'),
      key: 'success',
    });
    router.push(`/login${route.fullPath.replace(route.path, '')}`);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 处理失败
 * @param errors - 错误信息
 */
const handleFinishFailed = (errors: unknown) => {
  console.error('错误信息:', errors);
};

/** 点击获取验证码 */
const onVerificationCode = () => {
  const phone = formState.phone;

  if (!phone) {
    return message.warning({
      content: t('public.pleaseEnter', { name: t('login.phoneNumber') }),
      key: 'phone',
    });
  }

  // 匹配是否是正确手机号码
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(String(phone))) {
    return message.warning({
      content: t('login.phoneNumberError'),
      key: 'phone',
    });
  }

  verificationTime.value = 60;
  timer = setInterval(() => {
    if (verificationTime.value <= 1) {
      if (timer) clearInterval(timer);
      timer = null;
      verificationTime.value = 0;
      return;
    }
    verificationTime.value -= 1;
  }, 1000);
  // ...获取验证码逻辑
};
</script>

<template>
  <div
    :class="`
      ${themeCache === 'dark' ? 'bg-black text-white' : 'bg-light-400'}
      w-screen
      h-screen
      relative
    `"
  >
    <div class="absolute top-5 right-5 flex">
      <I18n />
      <Theme />
    </div>

    <div
      :class="`
        ${themeCache === 'dark' ? 'bg-black bg-dark-200' : 'bg-white'}
        w-400px
        p-2rem
        rounded-10px
        box-border
        absolute
        left-1/2
        top-1/2
        -translate-x-1/2
        -translate-y-1/2
        shadow-[2px_5px_20px_rgba(0,0,0,0.1)]
      `"
    >
      <div class="flex items-center justify-center pb-30px">
        <img class="mr-2 object-contain" width="32" height="32" :src="Logo" alt="LOGO" />
        <span class="text-22px font-bold tracking-2px">{{ t('login.resetPassword') }}</span>
      </div>

      <Form
        ref="formRef"
        :model="formState"
        layout="vertical"
        autocomplete="off"
        @finish="handleFinish"
        @finish-failed="handleFinishFailed"
      >
        <Form.Item
          name="username"
          :label="t('login.username')"
          :rules="[{ required: true, message: t('public.pleaseEnter', { name: t('login.username') }) }]"
        >
          <Input
            v-model:value="formState.username"
            allow-clear
            :placeholder="t('public.pleaseEnter', { name: t('login.username') })"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          :label="t('login.phoneNumber')"
          :rules="[{ required: true, message: t('public.pleaseEnter', { name: t('login.phoneNumber') }) }]"
        >
          <InputNumber
            v-model:value="formState.phone"
            class="w-full"
            :min="0"
            :controls="false"
            :placeholder="t('public.pleaseEnter', { name: t('login.phoneNumber') })"
          />
        </Form.Item>

        <Form.Item
          name="verification"
          :label="t('login.verificationCode')"
          :rules="[{ required: true, message: t('public.pleaseEnter', { name: t('login.verificationCode') }) }]"
        >
          <div class="flex w-full">
            <InputNumber
              v-model:value="formState.verification"
              class="w-full"
              :min="0"
              :controls="false"
              :placeholder="t('public.pleaseEnter', { name: t('login.verificationCode') })"
            />
            <Button class="ml-10px" :disabled="verificationTime > 0" @click="onVerificationCode">
              {{ verificationTime > 0 ? `${verificationTime}s` : t('login.getVerificationCode') }}
            </Button>
          </div>
        </Form.Item>

        <Form.Item
          name="newPassword"
          :label="t('login.newPassword')"
          :rules="[
            { required: true, message: t('public.pleaseEnter', { name: t('login.newPassword') }) },
            PASSWORD_RULE(t),
          ]"
        >
          <Input.Password
            v-model:value="formState.newPassword"
            allow-clear
            :placeholder="t('public.pleaseEnter', { name: t('login.newPassword') })"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          :label="t('login.confirmPassword')"
          :rules="[
            { required: true, message: t('public.pleaseEnter', { name: t('login.confirmPassword') }) },
            PASSWORD_RULE(t),
          ]"
        >
          <Input.Password
            v-model:value="formState.confirmPassword"
            allow-clear
            :placeholder="t('public.pleaseEnter', { name: t('login.confirmPassword') })"
          />
        </Form.Item>

        <Button type="primary" html-type="submit" class="w-full" :loading="isLoading">
          {{ t('public.submit') }}
        </Button>
      </Form>
    </div>
  </div>
</template>
