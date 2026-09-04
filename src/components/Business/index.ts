import type { Component } from 'vue';
import { addComponent } from '@/components/Form/utils/componentMap';

/** 业务组件名集合（表单 component 可用值） */
export type BusinessComponents = 'GameSelect' | 'PartnerSelect';

/**
 * 注册业务组件到表单组件注册表
 */
export function CreateBusiness() {
  // 使用动态 import 避免循环依赖
  Promise.all([
    import('./Selects/GameSelect.vue'),
    import('./Selects/PartnerSelect.vue'),
  ]).then(([GameSelect, PartnerSelect]) => {
    addComponent('GameSelect', GameSelect.default as Component);
    addComponent('PartnerSelect', PartnerSelect.default as Component);
  });
}
