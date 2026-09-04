import type { PluginOption } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * 打包完后生成 .nojekyll 空文件
 * Github Pages 默认基于 Jekyll 构建，会忽略下划线开头的文件
 */
export const nojekyllPlugin = (): PluginOption => {
  return {
    name: 'vite-create-nojekyll',
    closeBundle() {
      // 构建完成后在 dist 目录创建 .nojekyll 文件
      const distPath = path.resolve(process.cwd(), 'dist');
      const noJekyllPath = path.join(distPath, '.nojekyll');

      try {
        fs.writeFileSync(noJekyllPath, '');
        console.log('生成.nojekyll成功');
      } catch (error) {
        console.error('生成.nojekyll失败:', error);
      }
    },
  };
};
