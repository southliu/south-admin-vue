import type { PropType, VNode } from 'vue';
import type { PermissionData } from '@/servers/system/role';
import { defineComponent, h } from 'vue';
import { Checkbox } from 'ant-design-vue';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons-vue';
import { Icon } from '@iconify/vue';

/** 递归树节点（render函数组件） */
const TreeNode = defineComponent({
  name: 'MenuAuthorizeTreeNode',
  props: {
    list: { type: Array as PropType<PermissionData[]>, default: () => [] },
    step: { type: Number, default: 0 },
    checkedKeys: { type: Array as PropType<(string | number)[]>, default: () => [] },
    expandedKeys: { type: Array as PropType<(string | number)[]>, default: () => [] },
    getChildKeys: {
      type: Function as PropType<(item?: PermissionData) => (string | number)[]>,
      required: true,
    },
    getCheckedStatus: {
      type: Function as PropType<
        (item: PermissionData) => { checked: boolean; indeterminate: boolean }
      >,
      required: true,
    },
  },
  emits: ['toggleExpand', 'check'],
  setup(props, { emit }) {
    const renderList = (list: PermissionData[], step: number): VNode | null => {
      if (!list?.length) return null;
      const isAuthorizeBtnList = list.every((item) => item.type === 3);

      return h(
        'div',
        {
          class: isAuthorizeBtnList ? 'inline-block' : 'block',
          style: { marginLeft: isAuthorizeBtnList ? `${(step + 1) * 20}px` : 0 },
        },
        list.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = props.expandedKeys.includes(item.key);
          const { checked, indeterminate } = props.getCheckedStatus(item);
          const isAuthorizeBtn = item.type === 3;
          const marginLeft = isAuthorizeBtn ? 10 : step * 20;

          return h('div', { key: item.key, class: isAuthorizeBtn ? 'inline-block' : 'block' }, [
            h('div', { class: 'flex items-center', style: { marginLeft: `${marginLeft}px` } }, [
              hasChildren
                ? h(
                    'div',
                    {
                      class: 'text-12px inline-block cursor-pointer p-5px',
                      onClick: () => emit('toggleExpand', item.key),
                    },
                    () => (isExpanded ? h(CaretDownOutlined) : h(CaretRightOutlined)),
                  )
                : h('div', { class: !isAuthorizeBtn ? 'w-24px h-24px' : '' }),
              h(
                Checkbox,
                {
                  checked,
                  indeterminate,
                  onChange: (e: { target: { checked: boolean } }) =>
                    emit('check', e.target.checked, item),
                  class: 'w-full',
                },
                () =>
                  h('div', { class: 'flex items-center gap-5px' }, [
                    item?.icon && typeof item.icon === 'string'
                      ? h(Icon, { icon: item.icon, class: 'text-16px' })
                      : null,
                    h('div', { class: 'flex-1' }, String(item.title)),
                  ]),
              ),
            ]),
            hasChildren && isExpanded ? renderList(item.children!, step + 1) : null,
          ]);
        }),
      );
    };

    return () => renderList(props.list, props.step);
  },
});

export default TreeNode;
