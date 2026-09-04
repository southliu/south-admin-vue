/** 支持的语言 */
export type Langs = 'zh' | 'en';

/** 语言选项 */
export const LANGUAGE_OPTIONS: { label: string; value: Langs }[] = [
  { label: '简体中文', value: 'zh' },
  { label: 'English', value: 'en' },
];
