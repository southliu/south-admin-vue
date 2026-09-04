import { defineConfig, presetAttributify, presetIcons, presetWind3 } from 'unocss';

export default defineConfig({
  presets: [
    // 默认原子类预设（tailwind 兼容）
    presetWind3(),
    // 属性化模式
    presetAttributify(),
    // 图标预设（class 方式使用 iconify）
    presetIcons(),
  ],
});
