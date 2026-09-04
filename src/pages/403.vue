<script setup lang="ts">
import { Button, Result } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { getFirstMenu } from '@/menus/utils/helper';
import { useCommonStore } from '@/hooks/useCommonStore';
import styles from './all.module.less';

defineOptions({ name: 'Forbidden' });

const { t } = useI18n();
const router = useRouter();
const { permissions, menuList } = useCommonStore();

/** 返回首页 */
const onGoHome = () => {
  const firstMenu = getFirstMenu(menuList.value, permissions.value);
  if (firstMenu) router.push(firstMenu);
};
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <Result status="403" :title="403" :sub-title="t('public.notPermissionMessage')">
      <template #extra>
        <Button type="primary" :class="styles.shake" @click="onGoHome">
          {{ t('public.returnHome') }}
        </Button>
      </template>
    </Result>
  </div>
</template>
