import { createI18n } from 'vue-i18n';
import { LANG } from '@/utils/config';

export const languages = ['zh', 'en'] as const;

// 通过 import.meta.glob 自动装配语言包（zh/en）
const zhModules = import.meta.glob('./zh/**/*.ts', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>;
const enModules = import.meta.glob('./en/**/*.ts', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>;

/**
 * 语言模块转消息对象
 * ./zh/public.ts -> public 命名空间
 * ./zh/systems/menu.ts -> systems.menu 命名空间
 */
function modulesToMessages(
  modules: Record<string, { default: Record<string, unknown> }>,
  lang: string,
) {
  type Messages = { [key: string]: unknown };
  const messages: Messages = {};

  for (const path in modules) {
    // 去除 ./zh/ 前缀和 .ts 后缀
    const name = path.replace(`./${lang}/`, '').replace(/\.ts$/, '');
    const keys = name.split('/');

    // 嵌套命名空间
    let current = messages;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) current[key] = {};
      current = current[key] as Messages;
    }

    current[keys[keys.length - 1]] = modules[path].default;
  }

  return messages;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const i18n = createI18n<any, 'zh' | 'en'>({
  // 组合式 API 模式
  legacy: false,
  // 默认语言（本地缓存优先）
  locale: (localStorage.getItem(LANG) as 'zh' | 'en') || 'zh',
  fallbackLocale: 'zh',
  messages: {
    zh: modulesToMessages(zhModules, 'zh'),
    en: modulesToMessages(enModules, 'en'),
  },
});

export default i18n;
