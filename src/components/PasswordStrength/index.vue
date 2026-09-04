<script setup lang="ts">
import { Input } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import StrengthBar from './components/StrengthBar.vue';

defineOptions({ name: 'PasswordStrength' });

// 密码值（表单 autoLink 注入 value/onChange）
const value = defineModel<string>('value');

const props = defineProps<{
  placeholder?: string;
}>();

const { t } = useI18n();
const strength = ref(0);

/**
 * 密码强度判断
 * @param value - 值
 */
const handleStrength = useDebounceFn((value: string) => {
  if (!value) return;
  let level = 0;
  if (/\d/.test(value)) level++; // 有数字强度加1
  if (/[a-z]/.test(value)) level++; // 有小写字母强度加1
  if (/[A-Z]/.test(value)) level++; // 有大写字母强度加1
  if (value.length > 10) level++; // 长度大于10强度加1
  if (/[\.\~\@\#\$\^\&\*]/.test(value)) level++; // 有以下特殊字符强度加1
  strength.value = level;
}, 500);

// 监听值变化
watch(value, (val) => {
  handleStrength(val || '');
});
</script>

<template>
  <div>
    <Input.Password
      v-model:value="value"
      allow-clear
      :placeholder="props.placeholder || t('public.inputPleaseEnter')"
      autocomplete="password"
    />

    <StrengthBar v-if="strength" :strength="strength" />
  </div>
</template>
