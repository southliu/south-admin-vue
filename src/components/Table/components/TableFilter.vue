<script setup lang="ts">
import type { TableColumn } from '#/public';
import { Button, Checkbox, Dropdown, Menu } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { SettingOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

defineOptions({ name: 'TableFilter' });

const props = defineProps<{
  columns: TableColumn[];
  filters: string[];
  sortList: string[];
}>();

const emit = defineEmits<{
  (e: 'change', checks: string[], sortList: string[]): void;
}>();

const { t } = useI18n();

// 全选状态
const checkAll = computed(() => props.filters.length === props.columns.length);

/**
 * 全选/反选
 * @param e - 事件
 */
const onCheckAllChange = (e: { target: { checked: boolean } }) => {
  const keys = e.target.checked ? props.columns.map((item) => String(item.dataIndex)) : [];
  emit('change', keys, keys);
};

/**
 * 勾选列
 * @param checkedValues - 勾选值
 */
const onCheckChange = (checkedValues: (string | number | boolean)[]) => {
  const keys = checkedValues.map(String);
  // 过滤掉被取消勾选的排序项
  const sortList = props.sortList.filter((item) => keys.includes(item));
  emit('change', keys, sortList);
};

/**
 * 排序（上移/下移）
 * @param dataIndex - 列key
 * @param type - 类型
 */
const onSort = (dataIndex: string, type: 'up' | 'down') => {
  const index = props.sortList.indexOf(dataIndex);
  if (index < 0) return;

  const newList = [...props.sortList];
  const swapIndex = type === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= newList.length) return;

  [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
  emit('change', props.filters, newList);
};
</script>

<template>
  <Dropdown trigger="click">
    <Button class="small-btn">
      <template #icon><SettingOutlined /></template>
      {{ t('public.columnFilter') }}
    </Button>
    <template #overlay>
      <Menu>
        <div class="min-w-150px p-10px">
          <div class="border-b border-solid border-gray-200 pb-5px">
            <Checkbox :checked="checkAll" @change="onCheckAllChange">
              {{ t('public.checkAll') }}
            </Checkbox>
          </div>
          <Checkbox.Group
            :value="filters"
            class="flex flex-col"
            @change="onCheckChange"
          >
            <div
              v-for="col in columns"
              :key="String(col.dataIndex)"
              class="flex items-center justify-between pr-5px"
            >
              <Checkbox :value="String(col.dataIndex)">
                {{ col.title }}
              </Checkbox>
              <span v-if="filters.includes(String(col.dataIndex))" class="flex">
                <Icon
                  class="mx-2px cursor-pointer text-14px"
                  icon="ant-design:caret-up-outlined"
                  @click="onSort(String(col.dataIndex), 'up')"
                />
                <Icon
                  class="mx-2px cursor-pointer text-14px"
                  icon="ant-design:caret-down-outlined"
                  @click="onSort(String(col.dataIndex), 'down')"
                />
              </span>
            </div>
          </Checkbox.Group>
        </div>
      </Menu>
    </template>
  </Dropdown>
</template>
