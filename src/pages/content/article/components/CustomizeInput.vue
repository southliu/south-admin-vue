<script setup lang="ts">
import { Input } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'CustomizeInput' });

const value = defineModel<string>('value');

const { t } = useI18n();
</script>

<template>
  <div>
    <Input v-model:value="value" v-bind="$attrs" :placeholder="t('public.inputPleaseEnter')" />
    <div class="mb-5px text-red">{{ t('content.sensitiveInfo') }}</div>
  </div>
</template>
