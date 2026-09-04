import { createPinia } from 'pinia';

export { useUserStore } from './user';
export { useMenuStore } from './menu';
export { usePublicStore } from './public';
export { useTabsStore } from './tabs';

export const store = createPinia();
