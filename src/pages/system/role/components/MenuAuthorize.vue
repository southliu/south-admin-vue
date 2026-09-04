<script setup lang="ts">
import type { PermissionData } from '@/servers/system/role';
import { Checkbox, Spin } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { usePublicStore } from '@/stores/public';
import TreeNode from './TreeNode';

defineOptions({ name: 'MenuAuthorize' });

const props = withDefaults(
  defineProps<{
    isBordered?: boolean;
    isLoading?: boolean;
    treeData: PermissionData[];
    defaultCheckedKeys?: (string | number)[];
  }>(),
  {
    isBordered: true,
    isLoading: false,
    treeData: () => [],
    defaultCheckedKeys: () => [],
  },
);

const emit = defineEmits<{
  (e: 'change', checkedKeys: (string | number)[]): void;
}>();

const publicStore = usePublicStore();
const checkedKeys = ref<(string | number)[]>([]);
const expandedKeys = ref<(string | number)[]>([]);

// 同步默认勾选
watch(
  () => props.defaultCheckedKeys,
  (value) => {
    checkedKeys.value = value?.length ? value.map((item) => item?.toString()) : [];
  },
  { immediate: true },
);

/**
 * 获取所有节点的key
 */
const getAllKeys = (data: PermissionData[]): (string | number)[] => {
  const keys: (string | number)[] = [];

  const traverse = (nodes: PermissionData[]) => {
    nodes.forEach((node) => {
      keys.push(node.key);
      if (node.children) {
        traverse(node.children);
      }
    });
  };

  traverse(data);
  return keys;
};

/**
 * 获取子节点全部key
 */
const getChildKeys = (item?: PermissionData): (string | number)[] => {
  if (!item?.children?.length) return [];
  const result: (string | number)[] = [];

  for (const child of item.children) {
    if (child?.key) result.push(child.key);
    if (child?.children?.length) {
      result.push(...getChildKeys(child));
    }
  }
  return result;
};

/**
 * 更新选中状态
 */
const updateCheckedKeys = (keys: (string | number)[]) => {
  checkedKeys.value = keys;
  emit('change', keys);
};

/**
 * 处理节点选中/取消选中
 * @param checked - 是否选中
 * @param item - 节点数据
 */
const handleCheck = (checked: boolean, item: PermissionData) => {
  const { key } = item;
  const childrenKeys = getChildKeys(item);
  const newKeys = [...checkedKeys.value];

  if (checked) {
    // 添加选中项
    if (!newKeys.includes(key)) {
      newKeys.push(key);
    }

    // 选中时将所有子节点也选中
    for (const child of childrenKeys) {
      if (!newKeys.includes(child)) {
        newKeys.push(child);
      }
    }
  } else {
    // 取消选中
    for (let i = 0; i < newKeys.length; i++) {
      const newKey = newKeys[i];
      if (childrenKeys.includes(newKey) || newKey === key) {
        newKeys.splice(i, 1);
        i--;
      }
    }
  }

  updateCheckedKeys(newKeys);
};

/** 全选/取消全选 */
const handleCheckAll = (e: { target: { checked: boolean } }) => {
  const checked = e.target.checked;
  updateCheckedKeys(checked ? getAllKeys(props.treeData) : []);
};

/**
 * 切换展开/收起状态
 */
const toggleExpand = (key: string | number) => {
  if (expandedKeys.value.includes(key)) {
    expandedKeys.value = expandedKeys.value.filter((k) => k !== key);
  } else {
    expandedKeys.value.push(key);
  }
};

/**
 * 获取所有可展开的节点key
 */
const getAllExpandableKeys = (data: PermissionData[]): (string | number)[] => {
  const keys: (string | number)[] = [];

  const traverse = (nodes: PermissionData[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        keys.push(node.key);
        traverse(node.children);
      }
    });
  };

  traverse(data);
  return keys;
};

// 是否全选
const isAllChecked = computed(() => {
  const allKeys = getAllKeys(props.treeData);
  return checkedKeys.value.length > 0 && allKeys.every((item) => checkedKeys.value.includes(item));
});

const hasCheckedKeys = computed(() => checkedKeys.value.length > 0);

// 是否全部展开
const isAllExpanded = computed(() => {
  return expandedKeys.value.length === getAllExpandableKeys(props.treeData).length;
});

/** 展开/收起所有节点 */
const toggleExpandAll = () => {
  expandedKeys.value = isAllExpanded.value ? [] : getAllExpandableKeys(props.treeData);
};

/**
 * 节点勾选状态（半选/联动）
 */
const getCheckedStatus = (item: PermissionData) => {
  const childrenKeys = getChildKeys(item);

  if (!childrenKeys.length) {
    return {
      checked: checkedKeys.value.includes(item.key),
      indeterminate: false,
    };
  }

  const checkedChildren = childrenKeys.filter((child) => checkedKeys.value.includes(child));
  const isIndeterminate =
    checkedChildren.length > 0 && checkedChildren.length < childrenKeys.length;
  const isChecked =
    checkedChildren.length === childrenKeys.length || checkedKeys.value.includes(item.key);

  return { checked: isChecked, indeterminate: isIndeterminate };
};
</script>

<template>
  <Spin :spinning="isLoading">
    <div :class="isBordered ? `b ${publicStore.theme === 'dark' ? 'b-#454545' : 'b-#E4E4E7'} b-rd-8px` : ''">
      <div class="p-10px">
        <div class="mb-10px flex items-center justify-between">
          <Checkbox
            :checked="isAllChecked"
            :indeterminate="!isAllChecked && hasCheckedKeys"
            @change="handleCheckAll"
          >
            全选
          </Checkbox>
          <div class="cursor-pointer text-12px text-blue-500" @click="toggleExpandAll">
            {{ isAllExpanded ? '收起所有' : '展开所有' }}
          </div>
        </div>

        <!-- 树节点渲染 -->
        <TreeNode
          :list="treeData"
          :step="0"
          :checked-keys="checkedKeys"
          :expanded-keys="expandedKeys"
          :get-child-keys="getChildKeys"
          :get-checked-status="getCheckedStatus"
          @toggle-expand="toggleExpand"
          @check="handleCheck"
        />
      </div>
    </div>
  </Spin>
</template>
