<script setup lang="ts">
import type { LoginData } from './model';
import { Button, Checkbox, Form, Input } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import I18n from '@/components/I18n/index.vue';
import Theme from '@/components/Theme/index.vue';
import { login } from '@/servers/login';
import { LOGIN_EXPIRED_MSG } from '@/servers/request';
import { setTitle } from '@/utils/helper';
import { getMenuList } from '@/servers/system/menu';
import { encryption, decryption } from '@/utils/crypto';
import { getFirstMenu } from '@/menus/utils/helper';
import { cancelAllRequest } from '@/servers';
import { message } from '@/utils/message';
import { PASSWORD_RULE, THEME_KEY } from '@/utils/config';
import { useToken } from '@/hooks/useToken';
import { useCommonStore } from '@/hooks/useCommonStore';
import { usePublicStore } from '@/stores/public';
import Logo from '@/assets/images/logo.svg';

defineOptions({ name: 'Login' });

const CHECK_REMEMBER = 'remember_me';
const USER_USERNAME = 'login_username';
const USER_PASSWORD = 'login_password';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { setToken } = useToken();
const publicStore = usePublicStore();
const themeCache = (localStorage.getItem(THEME_KEY) || 'light') as
  'dark' | 'light';

const isLoading = ref(false);
const isRemember = ref(true);

const formState = reactive<LoginData>({
  username: import.meta.env.VITE_SHOW_DEFAULT_ACCOUNT === 'true' ? 'admin' : '',
  password:
    import.meta.env.VITE_SHOW_DEFAULT_ACCOUNT === 'true' ? 'admin123456' : '',
});

// 主题初始化
if (themeCache === 'dark') {
  document.body.className = 'theme-dark';
}
publicStore.setThemeValue(themeCache === 'dark' ? 'dark' : 'light');

// 初始化
const init = () => {
  // 清除上一会话的残留请求
  cancelAllRequest();

  // 如果存在记住我缓存
  const remember = localStorage.getItem(CHECK_REMEMBER);
  isRemember.value = remember !== 'false';

  // 如果存在账号密码缓存，则自动填充
  const username = localStorage.getItem(USER_USERNAME);
  const password = localStorage.getItem(USER_PASSWORD);
  if (username && password) {
    const newPassword = decryption(password) as { value: string } | null;
    formState.username = username;
    formState.password = newPassword?.value || '';
  }

  // 读取权限过期提示（由请求拦截器在整页跳转前写入 localStorage）
  const expiredMsg = localStorage.getItem(LOGIN_EXPIRED_MSG);
  if (expiredMsg) {
    message.error({ content: expiredMsg, key: 'permission-expired' });
    localStorage.removeItem(LOGIN_EXPIRED_MSG);
  }
};
init();

// 语言切换修改title
watch(
  locale,
  () => {
    setTitle(t, t('login.login'));
  },
  { immediate: true },
);

/** 获取菜单数据 */
const getMenuData = async () => {
  const { code, data } = await getMenuList();
  if (Number(code) !== 200) return [];
  return data || [];
};

/**
 * 菜单跳转
 * @param perms - 权限列表
 */
const handleGoMenu = async (perms: string[]) => {
  let menuData = useCommonStore().menuList.value;
  if (!menuData?.length) {
    menuData = (await getMenuData()) as typeof menuData;
  }

  // 菜单仍为空（接口失败或返回空），无法确定跳转目标
  if (!menuData?.length) {
    return message.error({
      content: t('login.notPermissions'),
      key: 'permissions',
    });
  }

  const redirect = route.query.redirect;
  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//')
  ) {
    await router.push(redirect);
    return;
  }

  // 有权限则直接跳转第一个有效菜单
  const firstMenu = getFirstMenu(menuData, perms);
  if (!firstMenu) {
    return message.error({
      content: t('login.notPermissions'),
      key: 'permissions',
    });
  }
  router.push(firstMenu);
};

/**
 * 处理登录
 * @param values - 表单数据
 */
const handleFinish = async (values: LoginData) => {
  try {
    isLoading.value = true;
    const { code, data } = await login(values);
    if (Number(code) !== 200) return;
    const { token, user, permissions: perms } = data;

    // 处理记住我逻辑
    const passwordObj = { value: values.password, expire: 0 };
    handleRemember(values.username, encryption(passwordObj));

    if (!perms?.length || !token) {
      return message.error({
        content: t('login.notPermissions'),
        key: 'permissions',
      });
    }

    setToken(token);
    const { userStore, menuStore } = useCommonStore();
    userStore.setUserInfo(user);
    userStore.setPermissions(perms);

    // 缓存菜单
    const menuData = await getMenuData();
    menuStore.setMenuList(menuData);

    await handleGoMenu(perms);
  } catch {
    // 请求层已统一提示错误，结束当前操作并允许重试。
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

/** 点击记住我 */
const onRemember = () => {
  isRemember.value = !isRemember.value;
  localStorage.setItem(CHECK_REMEMBER, isRemember.value ? 'true' : 'false');
};

/**
 * 记住我逻辑
 */
const handleRemember = (username: string, password: string) => {
  if (isRemember.value) {
    localStorage.setItem(USER_USERNAME, username);
    localStorage.setItem(USER_PASSWORD, password);
  } else {
    localStorage.removeItem(USER_USERNAME);
    localStorage.removeItem(USER_PASSWORD);
  }
};

/** 点击忘记密码 */
const onForgetPassword = () => {
  router.push(`/forget${route.fullPath.replace(route.path, '')}`);
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
        w-340px
        p-1.8rem
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
      <div class="flex items-center justify-center pb-20px pt-10px">
        <img
          class="mr-2 object-contain"
          width="32"
          height="32"
          :src="Logo"
          alt="LOGO"
        />
        <span class="text-22px font-bold tracking-2px">{{
          t('login.systemLogin')
        }}</span>
      </div>

      <Form
        ref="formRef"
        :model="formState"
        layout="vertical"
        name="horizontal_login"
        autocomplete="on"
        @finish="handleFinish"
        @finish-failed="handleFinishFailed"
      >
        <div class="mb-8px text-14px text-#AAA6A6">
          {{ t('login.username') }}
        </div>

        <Form.Item
          name="username"
          class="!mb-15px"
          :rules="[
            {
              required: true,
              message: t('public.pleaseEnter', { name: t('login.username') }),
            },
          ]"
        >
          <Input
            v-model:value="formState.username"
            allow-clear
            :placeholder="
              t('public.pleaseEnter', { name: t('login.username') })
            "
            autocomplete="username"
          />
        </Form.Item>

        <div class="mb-8px text-14px text-#AAA6A6">
          {{ t('login.password') }}
        </div>

        <Form.Item
          name="password"
          class="!mb-15px"
          :rules="[
            {
              required: true,
              message: t('public.pleaseEnter', { name: t('login.password') }),
            },
            PASSWORD_RULE(t),
          ]"
        >
          <Input.Password
            v-model:value="formState.password"
            :placeholder="
              t('public.pleaseEnter', { name: t('login.password') })
            "
            autocomplete="current-password"
          />
        </Form.Item>

        <Button
          type="primary"
          html-type="submit"
          class="mt-15px mb-25px w-full rounded-5px tracking-2px"
          :loading="isLoading"
        >
          {{ t('login.login') }}
        </Button>
      </Form>

      <div class="mb-5px flex items-center justify-between px-1px">
        <Checkbox :checked="isRemember" @change="onRemember">
          {{ t('login.rememberMe') }}
        </Checkbox>

        <div class="cursor-pointer text-blue-500" @click="onForgetPassword">
          {{ t('login.forgetPassword') }}
        </div>
      </div>
    </div>
  </div>
</template>
