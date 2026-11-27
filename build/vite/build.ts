import type { BuildOptions } from 'vite';

/** 使用 Vite 8 原生 Rolldown / Oxc 构建现代浏览器产物。 */
export function buildOptions(): BuildOptions {
  return {
    target: 'baseline-widely-available',
    chunkSizeWarningLimit: 1000,
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'oxc',
    rolldownOptions: {
      output: {
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]',
      },
    },
  };
}
