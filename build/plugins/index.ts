import type { PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import vue from '@vitejs/plugin-vue';
import unocss from 'unocss/vite';
import viteCompression from 'vite-plugin-compression';
import { timePlugin } from './time.ts';
import { nojekyllPlugin } from './nojekyll.ts';
import { componentsPlugin } from './components.ts';
import { versionUpdatePlugin } from './version.ts';

/**
 * 创建 vite 插件
 */
export function createVitePlugins(): PluginOption[] {
  const isDev = process.env.NODE_ENV === 'development';

  const vitePlugins: PluginOption[] = [
    // vue3 插件
    vue(),
    unocss(),
    // 组件自动导入
    componentsPlugin(),
  ];

  // 生产环境才启用这些插件
  if (!isDev) {
    vitePlugins.push(
      // 压缩包
      viteCompression(),
      // 版本控制
      versionUpdatePlugin(),
      // 生成 .nojekyll 空文件
      nojekyllPlugin(),
      // 打包时间
      timePlugin(),
    );
  }

  if (process.env.REPORT === 'true') {
    vitePlugins.push(visualizer({ gzipSize: true, brotliSize: true }));
  }
  return vitePlugins;
}
