import type { PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import unocss from 'unocss/vite';
import viteCompression from 'vite-plugin-compression';
import { timePlugin } from './time';
import { nojekyllPlugin } from './nojekyll';
import { autoImportPlugin } from './autoImport';
import { componentsPlugin } from './components';
import { versionUpdatePlugin } from './version';

/**
 * 创建 vite 插件
 */
export function createVitePlugins(): PluginOption[] {
  const isDev = process.env.NODE_ENV === 'development';

  const vitePlugins: PluginOption[] = [
    // vue3 插件
    vue(),
    unocss(),
    // 自动导入
    autoImportPlugin(),
    // 组件自动导入
    componentsPlugin(),
  ];

  // 生产环境才启用这些插件
  if (!isDev) {
    vitePlugins.push(
      // 压缩包
      viteCompression(),
      // 兼容低版本
      legacy({
        targets: [
          'Android > 39',
          'Chrome >= 60',
          'Safari >= 10.1',
          'iOS >= 10.3',
          'Firefox >= 54',
          'Edge >= 15',
        ],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),
      // 版本控制
      versionUpdatePlugin(),
      // 生成 .nojekyll 空文件
      nojekyllPlugin(),
      // 包分析
      visualizer({
        gzipSize: true,
        brotliSize: true,
      }),
      // 打包时间
      timePlugin(),
    );
  }

  return vitePlugins;
}
