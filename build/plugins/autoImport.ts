import type { PluginOption } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';

/**
 * 自动导入处理
 */
export const autoImportPlugin = (): PluginOption => {
  return AutoImport({
    // 自动导入目录下的导出（hooks、stores、公共常量）
    dirs: [
      'src/hooks/**',
      'src/stores/**',
      'src/utils/config.ts',
      'src/utils/constants.ts',
      'src/utils/permissions.ts',
    ],
    imports: [
      // vue 组合式 api
      'vue',
      // vue-router
      'vue-router',
      // pinia
      'pinia',
      // vue-i18n
      'vue-i18n',
      // vueuse
      '@vueuse/core',
    ],
    dts: 'types/autoImports.d.ts',
    include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
  });
};
