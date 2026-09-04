<script setup lang="ts">
import type { PermissionData } from '@/servers/system/role';
import { Spin } from 'ant-design-vue';
import { onMounted, ref } from 'vue';
import { getRolePermission } from '@/servers/system/role';
import MenuAuthorize from './MenuAuthorize.vue';

defineOptions({ name: 'AuthorizeSelect' });

const props = defineProps<{
  id?: string;
  value?: (string | number)[];
}>();

const emit = defineEmits<{
  (e: 'change', value: number[]): void;
}>();

const list = ref<PermissionData[]>([]);
const isLoading = ref(false);

/** 获取数据 */
const getList = async () => {
  const params = { roleId: props.id };

  try {
    isLoading.value = true;
    const { code, data } = await getRolePermission(params);
    if (Number(code) !== 200) return;
    list.value = data?.treeData || [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getList();
});

/**
 * 点击复选框
 * @param checkedKeys - 勾选值
 */
const handleCheckedKeysChange = (checkedKeys: (string | number)[]) => {
  // 将字符串数组转换为整数数组
  const numberKeys = checkedKeys.map((key) =>
    typeof key === 'string' ? parseInt(key, 10) : (key as number),
  );
  emit('change', numberKeys);
};
</script>

<template>
  <Spin :spinning="isLoading">
    <MenuAuthorize
      is-bordered
      :tree-data="list"
      :default-checked-keys="value || []"
      @change="handleCheckedKeysChange"
    />
  </Spin>
</template>
