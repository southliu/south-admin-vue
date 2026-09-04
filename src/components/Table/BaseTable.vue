<script setup lang="ts">
import type { TableColumn } from '#/public';
import type { TableProps } from 'ant-design-vue';
import { Button, Table, Tag } from 'ant-design-vue';
import { PlusOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { computed, h, ref, watch } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { EMPTY_VALUE } from '@/utils/config';
import { filterTableColumns } from './utils/helper';
import TableFilter from './components/TableFilter.vue';
import './index.less';

defineOptions({ name: 'BaseTable' });

const props = withDefaults(
  defineProps<{
    columns?: TableColumn[];
    dataSource?: Record<string, unknown>[];
    rowKey?: string;
    isLoading?: boolean;
    isBordered?: boolean;
    isZebra?: boolean;
    isVirtual?: boolean;
    isOperate?: boolean;
    isAuthHeight?: boolean;
    isCreate?: boolean;
    scrollX?: number;
    scrollY?: number;
  } & Omit<TableProps, 'columns' | 'dataSource' | 'bordered'>>(),
  {
    columns: () => [],
    dataSource: () => [],
    rowKey: 'id',
    isLoading: false,
    isBordered: true,
    isZebra: true,
    isVirtual: false,
    isOperate: true,
    isAuthHeight: false,
    isCreate: false,
  },
);

const emit = defineEmits<{
  (e: 'getPage'): void;
  (e: 'onCreate'): void;
}>();

const { t } = useI18n();
const menuStore = useMenuStore();

// 列筛选与排序状态
const tableFilters = ref<string[]>([]);
const sortList = ref<string[]>([]);
const resizeColumns = ref<TableColumn[]>([]);

// 初始化列
const initColumns = () => {
  const newColumns = filterTableColumns(props.columns);
  resizeColumns.value = [...newColumns];
  const columnKeys = newColumns.map((col) => String(col.dataIndex)).filter(Boolean);
  tableFilters.value = columnKeys;
  sortList.value = columnKeys;
};

watch(
  () => props.columns,
  () => initColumns(),
  { immediate: true, deep: true },
);

/**
 * 列筛选回调
 * @param checks - 勾选列
 * @param newSortList - 排序列
 */
const getTableChecks = (checks: string[], newSortList: string[]) => {
  tableFilters.value = checks;
  sortList.value = newSortList;
};

/**
 * 处理列宽拖拽
 * @param index - 列下标
 */
const handleResize = (index: number) => (e: MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();

  const target = e.currentTarget as HTMLElement;
  const th = target.closest('th');
  if (!th) return;

  const startX = e.clientX;
  const startWidth = th.offsetWidth;

  const onMouseMove = (event: MouseEvent) => {
    const width = Math.max(60, startWidth + event.clientX - startX);
    if (resizeColumns.value[index]) {
      resizeColumns.value[index] = {
        ...resizeColumns.value[index]!,
        width,
      };
    }
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

/**
 * enum映射渲染
 * @param col - 列
 * @param value - 单元格值
 */
const handleEnumRender = (col: TableColumn, value: unknown) => {
  const enumList = col.enum;

  if (Array.isArray(enumList)) {
    for (const item of enumList) {
      if (String(item.value) === String(value)) {
        if (item?.type === 'tag') {
          return h(Tag, { color: item.color }, () => item.label);
        }
        return item.label;
      }
    }
  } else if (enumList && typeof enumList === 'object') {
    for (const key in enumList) {
      if (key === String(value)) {
        return enumList[key] as string;
      }
    }
  }

  // 空值显示
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE;
  }

  // 字符串数组用逗号分隔
  if (Array.isArray(value)) {
    const isStringArr = value.every((item) => typeof item === 'string');
    if (isStringArr) return value.join(', ') || EMPTY_VALUE;
  }

  return value as never;
};

// 合并列（筛选 + 排序 + enum渲染 + 自适应手机端）
const mergedColumns = computed<TableColumn[]>(() => {
  const result: TableColumn[] = [];

  for (const key of sortList.value) {
    const col = resizeColumns.value.find((item) => String(item.dataIndex) === key);
    if (!col) continue;

    result.push({
      ...col,
      ellipsis: col.ellipsis ?? true,
      // 手机端去除列固定，除非设置了isKeepFixed
      fixed: col?.fixed && !(menuStore.isPhone && !col?.isKeepFixed) ? col.fixed : false,
      customHeaderCell: (column) => {
        return {
          ...(col.customHeaderCell?.(column) || {}),
          class: 'table-resizable-title',
          onDblclick: (e: Event) => e.preventDefault(),
          onMousedown: handleResize(resizeColumns.value.indexOf(col)),
        } as Record<string, unknown>;
      },
      customRender: col.customRender
        ? col.customRender
        : ({ text }) => handleEnumRender(col, text),
    });
  }

  return result;
});

// 表格滚动
const tableScroll = computed(() => {
  const result: { x?: number; y?: number } = {};
  if (props.scrollX) result.x = props.scrollX;
  if (props.scrollY) result.y = props.scrollY;
  return Object.keys(result).length ? result : undefined;
});
</script>

<template>
  <div ref="tableRef" class="w-full" :class="isZebra ? 'zebra' : ''">
    <!-- 顶部操作栏（左侧：新增+额外内容；右侧：额外内容+刷新+列筛选） -->
    <div v-if="isOperate" class="table-operate">
      <div class="flex flex-wrap items-center gap-6px">
        <Button v-if="isCreate" type="primary" class="small-btn" @click="emit('onCreate')">
          <template #icon><PlusOutlined /></template>
          {{ t('public.create') }}
        </Button>

        <slot name="leftContent" />
      </div>

      <div class="flex flex-wrap items-center justify-end gap-6px">
        <slot name="rightContent" />

        <Button class="small-btn" @click="emit('getPage')">
          <template #icon><RedoOutlined class="-rotate-90" /></template>
          {{ t('public.refresh') }}
        </Button>

        <TableFilter
          :columns="resizeColumns"
          :filters="tableFilters"
          :sort-list="sortList"
          @change="getTableChecks"
        />
      </div>
    </div>

    <Table
      v-bind="$attrs"
      :columns="(mergedColumns as never)"
      :data-source="dataSource"
      :row-key="rowKey"
      :row-selection="rowSelection"
      :loading="isLoading"
      :bordered="isBordered"
      :scroll="tableScroll"
      :virtual="isVirtual"
      size="small"
      :pagination="false"
    >
      <!-- 透传全部插槽（操作列等） -->
      <template v-for="(_, name) in $slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </Table>
  </div>
</template>
