import type { PluginOption } from 'vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

/**
 * 组件自动导入处理（模板中直接使用 ant-design-vue 组件）
 */
export const componentsPlugin = (): PluginOption => {
  return Components({
    resolvers: [
      AntDesignVueResolver({
        // 自动引入组件库样式
        importStyle: false,
      }),
    ],
    dts: 'types/components.d.ts',
  });
};
