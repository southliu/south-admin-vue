<script setup lang="ts">
import { Dropdown } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import { useDropdownMenu } from '../hooks/useDropdownMenu';

defineOptions({ name: 'TabOptions' });

const props = defineProps<{
  activeKey: string;
  handleRefresh: (key: string) => void;
}>();

const isOpen = ref(false);

// 下拉菜单
const { items, onClick } = useDropdownMenu({
  activeKey: props.activeKey,
  handleRefresh: props.handleRefresh,
});
</script>

<template>
  <Dropdown
    trigger="click"
    :menu="{ items: items(), onClick: (e) => onClick(e.key as string) }"
    @open-change="(open: boolean) => (isOpen = open)"
  >
    <Icon
      :class="`
        flex
        items-center
        justify-center
        text-lg
        cursor-pointer
        transition-all
        transform
        ${isOpen ? 'rotate-180' : 'rotate-0'}
      `"
      icon="ant-design:down-outlined"
    />
  </Dropdown>
</template>
