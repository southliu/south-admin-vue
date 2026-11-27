<script setup lang="ts">
import { Button, Result, Tooltip } from 'ant-design-vue';
import {
  LogoutOutlined,
  MessageOutlined,
  RedoOutlined,
} from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { onErrorCaptured, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { createLog } from '@/servers/system/log';
import { useLogout } from '@/hooks/useLogout';

defineOptions({ name: 'ErrorBoundary' });

const { t } = useI18n();
const { handleLogout } = useLogout();
const userStore = useUserStore();
const route = useRoute();

const hasError = ref(false);
const error = ref<Error | null>(null);

// 捕获子组件错误
onErrorCaptured((err, _instance, info) => {
  console.error('错误信息:', err, info);
  hasError.value = true;
  error.value = err as Error;

  // 将错误信息上传至服务器
  sendErrorLog(err as Error, info);

  // 阻止错误继续向上传播
  return false;
});

/**
 * 发送错误日志
 * @param err - 错误
 * @param info - 错误信息
 */
const sendErrorLog = async (err: Error, info: string) => {
  try {
    const userInfo = userStore.userInfo;

    const logData = {
      username: userInfo?.username || 'anonymous',
      method: '',
      url: window.location.href,
      params: JSON.stringify({ info, content: err.stack || String(err) }),
      userAgent: navigator.userAgent,
      status: '500',
      error: err.toString(),
      latency: 0,
      type: 3, // 0=error, 1=success, 3=frontend
    };

    await createLog(logData);
  } catch (e) {
    console.error('发送错误日志失败:', e);
  }
};

/** 刷新当前页面 */
const handleRefresh = () => {
  window.location.reload();
};

/** 重置错误状态 */
const resetError = () => {
  hasError.value = false;
  error.value = null;
};
watch(() => route.path, resetError);
</script>

<template>
  <div v-if="hasError" class="flex h-full items-center justify-center">
    <Result
      status="error"
      :title="t('public.pageErrorTitle')"
      :sub-title="t('public.pagepageErrorSubTitle')"
    >
      <template #icon>
        <Tooltip :title="String(error)" placement="top">
          <MessageOutlined class="rotate-y-180" />
        </Tooltip>
      </template>

      <template #extra>
        <Button type="primary" @click="handleRefresh">
          <template #icon><RedoOutlined /></template>
          {{ t('public.refreshPage') }}
        </Button>
        <Button @click="handleLogout">
          <template #icon><LogoutOutlined /></template>
          {{ t('public.signOut') }}
        </Button>
      </template>
    </Result>
  </div>

  <slot v-else @vue:unhandled="resetError" />
</template>
