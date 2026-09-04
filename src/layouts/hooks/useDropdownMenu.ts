import type { MenuProps } from 'ant-design-vue';
import {
  CloseOutlined,
  RedoOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons-vue';
import { h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTabsStore } from '@/stores/tabs';

/** 标签操作枚举 */
export enum ITabEnums {
  REFRESH = 'refresh', // 重新加载
  CLOSE_CURRENT = 'close_current', // 关闭当前
  CLOSE_OTHER = 'close_other', // 关闭其他
  CLOSE_LEFT = 'close_left', // 关闭左侧
  CLOSE_RIGHT = 'close_right', // 关闭右侧
}

interface Props {
  activeKey: string;
  handleRefresh: (key: string) => void;
}

/**
 * 标签右键/操作下拉菜单
 * @param props - 参数
 */
export function useDropdownMenu(props: Props) {
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const tabsStore = useTabsStore();

  // 菜单项
  const items = (key = props.activeKey): MenuProps['items'] => {
    const index = tabsStore.tabs.findIndex((item) => item.key === key);
    return [
      {
        key: ITabEnums.REFRESH,
        label: t('public.reload'),
        disabled: key !== route.path,
        icon: () => h(RedoOutlined, { class: 'mr-5px transform rotate-270' }),
      },
      {
        key: ITabEnums.CLOSE_CURRENT,
        label: t('public.closeTab'),
        disabled: tabsStore.tabs.length <= 1,
        icon: () => h(CloseOutlined, { class: 'mr-5px' }),
      },
      {
        key: ITabEnums.CLOSE_OTHER,
        label: t('public.closeOther'),
        disabled: tabsStore.tabs.length <= 1,
        icon: () => h(VerticalAlignMiddleOutlined, { class: 'mr-5px transform rotate-90' }),
      },
      {
        key: ITabEnums.CLOSE_LEFT,
        label: t('public.closeLeft'),
        disabled: index === 0,
        icon: () => h(VerticalAlignTopOutlined, { class: 'mr-5px transform rotate-270' }),
      },
      {
        key: ITabEnums.CLOSE_RIGHT,
        label: t('public.closeRight'),
        disabled: index === tabsStore.tabs.length - 1,
        icon: () => h(VerticalAlignTopOutlined, { class: 'mr-5px transform rotate-90' }),
      },
    ];
  };

  /**
   * 点击菜单
   * @param type - 操作类型
   * @param key - 标签key
   */
  const onClick = (type: string, key = props.activeKey) => {
    switch (type) {
      // 重新加载
      case ITabEnums.REFRESH:
        props.handleRefresh(key);
        break;

      // 关闭当前
      case ITabEnums.CLOSE_CURRENT: {
        if (props.activeKey === route.path) {
          const currentIndex = tabsStore.tabs.findIndex((tab) => tab.key === props.activeKey);
          const nextPath = tabsStore.tabs[currentIndex > 0 ? currentIndex - 1 : 0].key;
          if (nextPath) {
            router.push(nextPath);
          }
        }
        tabsStore.closeTabs(key);
        break;
      }

      // 关闭其他
      case ITabEnums.CLOSE_OTHER:
        tabsStore.closeOther(key);
        router.push(key);
        break;

      // 关闭左侧
      case ITabEnums.CLOSE_LEFT:
        tabsStore.closeLeft(key);
        router.push(key);
        break;

      // 关闭右侧
      case ITabEnums.CLOSE_RIGHT:
        tabsStore.closeRight(key);
        router.push(key);
        break;

      default:
        break;
    }
  };

  return { items, onClick };
}
